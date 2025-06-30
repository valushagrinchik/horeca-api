import { BadRequestException, forwardRef, Inject, Injectable, Logger } from '@nestjs/common'
import { HorecaRequestCreateDto } from '../dto/horecaRequest.create.dto'
import { HorecaRequestDto } from '../dto/horecaRequest.dto'
import { AuthInfoDto } from '../../auth/dto/auth.info.dto'
import { HorecaRequestStatus, Prisma, ProviderRequestStatus, UploadsLinkType } from '@prisma/client'
import { UploadsLinkService } from '../../uploads/uploads.link.service'
import { HorecaRequestsDbService } from './horecaRequests.db.service'
import { HorecaRequestSetStatusDto } from '../dto/horecaRequest.approveProviderRequest.dto'
import { HorecaRequestWithProviderRequestsDto } from '../dto/horecaRequest.withProviderRequests.dto'
import { HorecaRequestSearchDto } from '../dto/horecaRequest.search.dto'
import { ChatWsGateway } from '../../chat/chat.ws.gateway'
import { NotificationWsGateway } from '../../notifications/notification.ws.gateway'
import * as dayjs from 'dayjs'
import {
    ErrorDto,
    ErrorCodes,
    PaginateValidateType,
    NotificationEvents,
    ChatServerMessages,
    ErrorValidationCodeEnum,
} from '@/shared/utils'
import { RequestsMatcherDbService } from '@/shared/requestsMatcher/requestsMatcher.db.service'
import { HorecaRequestWithActiveProviderRequestDto } from '../dto/horecaRequest.withActiveProviderRequest.dto'

@Injectable()
export class HorecaRequestsService {
    private readonly logger = new Logger(HorecaRequestsService.name)

    constructor(
        private horecaRequestsRep: HorecaRequestsDbService,
        private uploadsLinkService: UploadsLinkService,
        private notificationWsGateway: NotificationWsGateway,
        private requestsMatcherService: RequestsMatcherDbService,
        @Inject(forwardRef(() => ChatWsGateway))
        private chatWsGateway: ChatWsGateway
    ) {}

    async validate(auth: AuthInfoDto, id: number) {
        const horecaRequest = await this.horecaRequestsRep.getRawById(id)
        if (horecaRequest.userId != auth.id) {
            throw new BadRequestException(new ErrorDto(ErrorCodes.ITEM_NOT_FOUND))
        }
    }

    public async getRawById(id: number) {
        return this.horecaRequestsRep.getRawById(id)
    }

    async create(auth: AuthInfoDto, { imageIds, ...dto }: HorecaRequestCreateDto) {
        const now = dayjs()

        if (dto.acceptUntill < now.toDate() || dto.deliveryTime < now.toDate()) {
            throw new BadRequestException(
                new ErrorDto(
                    ErrorCodes.VALIDATION_ERROR,
                    [
                        dto.acceptUntill < now.toDate() && `acceptUntill|${ErrorValidationCodeEnum.INVALID}`,
                        dto.deliveryTime < now.toDate() && `deliveryTime|${ErrorValidationCodeEnum.INVALID}`,
                    ].filter(m => !!m)
                )
            )
        }
        if (dto.acceptUntill >= dto.deliveryTime) {
            throw new BadRequestException(
                new ErrorDto(ErrorCodes.VALIDATION_ERROR, [`acceptUntill|${ErrorValidationCodeEnum.INVALID}`])
            )
        }

        const horecaRequest = await this.horecaRequestsRep.create({
            ...dto,
            user: {
                connect: {
                    id: auth.id,
                },
            },
            items: {
                createMany: { data: dto.items },
            },
            categories: [...new Set(dto.items.map(item => item.category))],
        })

        if (imageIds?.length) {
            await this.uploadsLinkService.createMany(UploadsLinkType.HorecaRequest, horecaRequest.id, imageIds)
        }

        // TO update provider - horeca requests covering view
        this.requestsMatcherService.updateView()

        return this.get(horecaRequest.id, { items: true })
    }

    async get(id: number, include: Prisma.HorecaRequestInclude) {
        const horecaRequest = await this.horecaRequestsRep.get(id, include)
        if (!horecaRequest) {
            throw new BadRequestException(new ErrorDto(ErrorCodes.ITEM_NOT_FOUND))
        }
        const images = await this.uploadsLinkService.getImages(UploadsLinkType.HorecaRequest, [horecaRequest.id])

        return new HorecaRequestDto({
            ...horecaRequest,
            images: images[id],
        })
    }

    async getOneWithCounterProviderRequests(id: number) {
        const horecaRequest = await this.horecaRequestsRep.get(id)
        const images = await this.uploadsLinkService.getImages(UploadsLinkType.HorecaRequest, [horecaRequest.id])
        const providerRequestsImages = await this.uploadsLinkService.getImages(
            UploadsLinkType.ProviderRequestItem,
            horecaRequest.providerRequests.map(p => (p as any).items.map((i: any) => i.id)).flat()
        )
        const providerProfilesImage = await this.uploadsLinkService.getImages(
            UploadsLinkType.Profile,
            horecaRequest.providerRequests.map(p => (p as any).user.profile?.id).filter(el => !!el)
        )

        return new HorecaRequestWithProviderRequestsDto(
            {
                ...horecaRequest,
                images: images[id],
            },
            providerRequestsImages,
            providerProfilesImage
        )
    }

    async findAllAndCount(
        auth: AuthInfoDto,
        paginate: Partial<PaginateValidateType<HorecaRequestSearchDto>> = {}
    ): Promise<[HorecaRequestWithActiveProviderRequestDto[], number]> {
        const { status } = paginate.search

        const where = {
            userId: auth.id,
            status,
        }

        const horecaRequests = await this.horecaRequestsRep.findManyWithItems({
            where,
            ...(status == HorecaRequestStatus.Active
                ? {
                      include: {
                          providerRequests: {
                              where: {
                                  status: {
                                      in: [ProviderRequestStatus.Active, ProviderRequestStatus.Finished],
                                  },
                              },
                          },
                      },
                  }
                : {}),
            orderBy: {
                createdAt: 'desc',
                [paginate.sort.field]: paginate.sort.order,
            },
            take: paginate.limit,
            skip: paginate.offset,
        })

        const total = await this.horecaRequestsRep.count({
            where,
        })

        const images = await this.uploadsLinkService.getImages(
            UploadsLinkType.HorecaRequest,
            horecaRequests.map(h => h.id)
        )

        const data = horecaRequests.map(
            h =>
                new HorecaRequestWithActiveProviderRequestDto({
                    ...h,
                    images: images[h.id],
                })
        )

        return [data, total]
    }

    async findByCondition(args: Prisma.HorecaRequestFindManyArgs) {
        const horecaRequests = await this.horecaRequestsRep.findManyWithItems(args)

        const images = await this.uploadsLinkService.getImages(
            UploadsLinkType.HorecaRequest,
            horecaRequests.map(p => p.id)
        )

        return horecaRequests.map(
            p =>
                new HorecaRequestDto({
                    ...p,
                    images: images[p.id],
                })
        )
    }
    async countByCondition(args: Prisma.HorecaRequestCountArgs) {
        return this.horecaRequestsRep.count(args)
    }

    async isReadyForChat(auth: AuthInfoDto, { pRequestId, hRequestId }: { pRequestId: number; hRequestId: number }) {
        const request = await this.horecaRequestsRep.get(hRequestId, {
            providerRequests: {
                where: {
                    id: pRequestId,
                    status: ProviderRequestStatus.Active,
                },
            },
        })
        if (request?.status == HorecaRequestStatus.Active) {
            return request.providerRequests[0]
        }
        return null
    }

    async approveProviderRequest(dto: HorecaRequestSetStatusDto, notification: boolean = false) {
        await this.horecaRequestsRep.approveProviderRequest(dto)
        if (notification) {
            this.notificationWsGateway.sendNotification(
                dto.providerRequestId,
                NotificationEvents.PROVIDER_REQUEST_STATUS_CHANGED,
                {
                    data: {
                        pRequestId: dto.providerRequestId,
                        hRequestId: dto.horecaRequestId,
                        status: ProviderRequestStatus.Active,
                    },
                }
            )
        }
    }

    // Public method
    async cancelProviderRequest(dto: HorecaRequestSetStatusDto, byHoreca = true) {
        const horecaRequest = await this.horecaRequestsRep.cancelProviderRequest(dto)
        this.chatWsGateway.sendServerMessage({
            chatId: horecaRequest.providerRequests[0].chatId,
            message: ChatServerMessages.requestCanceled,
        })
        if (byHoreca) {
            this.notificationWsGateway.sendNotification(
                // to provider
                horecaRequest.providerRequests[0].userId,
                NotificationEvents.PROVIDER_REQUEST_STATUS_CHANGED,
                {
                    data: {
                        pRequestId: dto.providerRequestId,
                        hRequestId: dto.horecaRequestId,
                        status: horecaRequest.providerRequests[0].status,
                    },
                }
            )
        } else {
            // Notification to horeca only if request was active before
            this.notificationWsGateway.sendNotification(
                horecaRequest.userId,
                NotificationEvents.PROVIDER_REQUEST_STATUS_CHANGED,
                {
                    data: {
                        pRequestId: dto.providerRequestId,
                        hRequestId: dto.horecaRequestId,
                        status: horecaRequest.providerRequests[0].status,
                    },
                }
            )
        }
    }

    async cancel(id: number) {
        const horecaRequest = await this.horecaRequestsRep.get(id, {
            providerRequests: {
                where: {
                    status: {
                        in: [ProviderRequestStatus.Active, ProviderRequestStatus.Pending],
                    },
                },
            },
        })
        await this.horecaRequestsRep.cancel(id)
        ;(horecaRequest.providerRequests || []).map(providerRequest => {
            if (providerRequest.status == ProviderRequestStatus.Active) {
                this.chatWsGateway.sendServerMessage({
                    chatId: providerRequest.chatId,
                    message: ChatServerMessages.requestCanceled,
                })
            }

            this.notificationWsGateway.sendNotification(
                horecaRequest.userId,
                NotificationEvents.PROVIDER_REQUEST_STATUS_CHANGED,
                {
                    data: {
                        pRequestId: providerRequest.id,
                        hRequestId: horecaRequest.id,
                        status: ProviderRequestStatus.Canceled,
                    },
                }
            )
        })
    }

    // To render review block on the ui request to get review required and in case no review ws listen for notification
    async sendFirstReviewNotification() {
        const firstReviewNotificationRequests = await this.horecaRequestsRep.findAllForReview()

        for (const request of firstReviewNotificationRequests) {
            this.notificationWsGateway.sendNotification(request.userId, NotificationEvents.REVIEW, {
                data: {
                    hRequestId: request.id,
                    pRequestId: request.providerRequests[0].id,
                    chatId: request.providerRequests[0].chatId,
                },
            })
            await this.horecaRequestsRep.update({
                where: {
                    id: request.id,
                },
                data: {
                    reviewNotificationSent: true,
                },
            })
        }
        return firstReviewNotificationRequests
    }

    async sendSecondReviewNotification() {
        const secondReviewNotificationRequests = await this.horecaRequestsRep.findAllForReviewSecondNotification()
        for (const request of secondReviewNotificationRequests) {
            this.notificationWsGateway.sendNotification(request.userId, NotificationEvents.REVIEW_REMINDER, {
                data: {
                    hRequestId: request.id,
                    pRequestId: request.providerRequests[0].id,
                    chatId: request.providerRequests[0].chatId,
                },
            })
        }
        return secondReviewNotificationRequests
    }

    async handleRequestsOnReviewToComplete() {
        // 12 hours after second notification
        const hours84Ago = dayjs().add(-3, 'day').toDate()

        const completedSuccessfullyRequests =
            await this.horecaRequestsRep.findAllForReviewToCompleteSuccessfully(hours84Ago)
        const completedUnsuccessfullyRequests =
            await this.horecaRequestsRep.findAllForReviewToCompleteUnsuccessfully(hours84Ago)

        const completedSuccessfullyRequestsPromises = completedSuccessfullyRequests.map(hr =>
            this.horecaRequestsRep.update({
                where: { id: hr.id },
                data: {
                    status: HorecaRequestStatus.CompletedSuccessfully,
                },
            })
        )

        const completedUnsuccessfullyRequestsPromises = completedUnsuccessfullyRequests.map(hr =>
            this.horecaRequestsRep.update({
                where: { id: hr.id },
                data: {
                    status: HorecaRequestStatus.CompletedUnsuccessfully,
                },
            })
        )

        const promises = completedSuccessfullyRequestsPromises.concat(completedUnsuccessfullyRequestsPromises)
        return Promise.allSettled(promises).then(results => {
            return results.filter(res => res.status === 'fulfilled').map(res => res.value.id)
        })
    }

    async pastRequests(now = dayjs().toISOString()) {
        this.logger.log('Handling horeca past requests')
        // no provider requests untill acceptUntill passed
        const acceptUntillPassedRequestsIds = await this.horecaRequestsRep.handleCompletedUnsuccessfully(now)

        // deliveryTime passed
        const deliveryTimePassedRequestsIds = await this.horecaRequestsRep.handlePastNotCompletedRequests(now)

        return {
            acceptUntillPassedRequests: acceptUntillPassedRequestsIds.sort().toString(),
            deliveryTimePassedRequests: deliveryTimePassedRequestsIds.sort().toString(),
        }
    }

    async sendReviewNotification() {
        const requestsForFirstNotification = await this.sendFirstReviewNotification()
        const requestsForSecondNotification = await this.sendSecondReviewNotification()
        const completedRequestsIds = await this.handleRequestsOnReviewToComplete()

        return {
            requestsForFirstNotification: requestsForFirstNotification.map(r => r.id),
            requestsForSecondNotification: requestsForSecondNotification.map(r => r.id),
            requestsToComplete: completedRequestsIds.sort().toString(),
        }
    }
}
