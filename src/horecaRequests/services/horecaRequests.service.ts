import { BadRequestException, forwardRef, Inject, Injectable } from '@nestjs/common'
import { HorecaRequestCreateDto } from '../dto/horecaRequest.create.dto'
import { HorecaRequestDto } from '../dto/horecaRequest.dto'
import { AuthInfoDto } from '../../users/dto/auth.info.dto'
import {
    HorecaRequestStatus,
    Prisma,
    ProviderRequestStatus,
    UploadsLinkType,
    ProviderRequest,
    ProviderRequestItem,
} from '@prisma/client'
import { PaginateValidateType } from '../../system/utils/swagger/decorators'
import { UploadsLinkService } from '../../uploads/uploads.link.service'
import { HorecaRequestItemDto } from '../dto/horecaRequest.item.dto'
import { HorecaRequestsDbService } from './horecaRequests.db.service'
import { HorecaRequestSetStatusDto } from '../dto/horecaRequest.approveProviderRequest.dto'
import { HorecaRequestWithProviderRequestDto } from '../dto/horecaRequest.withProviderRequests.dto'
import { ErrorDto } from '../../system/utils/dto/error.dto'
import { ErrorCodes } from '../../system/utils/enums/errorCodes.enum'
import { NotificationWsGateway } from '../../notifications/notification.ws.gateway'
import * as dayjs from 'dayjs'
import { NotificationEvents } from '../../system/utils/enums/websocketEvents.enum'
import { ChatWsGateway } from '../../chat/chat.ws.gateway'
import { ChatServerMessages, DB_DATE_FORMAT } from '../../system/utils/constants'
import { HorecaRequestSearchDto } from '../dto/horecaRequest.search.dto'
import { ErrorValidationCodeEnum } from '../../system/utils/validation/error.validation.code.enum'

@Injectable()
export class HorecaRequestsService {
    constructor(
        private horecaRequestsRep: HorecaRequestsDbService,
        private uploadsLinkService: UploadsLinkService,
        private notificationWsGateway: NotificationWsGateway,
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
        })

        if (imageIds) {
            await this.uploadsLinkService.createMany(UploadsLinkType.HorecaRequest, horecaRequest.id, imageIds)
        }

        return this.get(horecaRequest.id)
    }

    async get(id: number) {
        const horecaRequest = await this.horecaRequestsRep.get(id)
        const images = await this.uploadsLinkService.getImages(UploadsLinkType.HorecaRequest, [horecaRequest.id])

        return new HorecaRequestWithProviderRequestDto({
            ...horecaRequest,
            items: horecaRequest.items.map(item => new HorecaRequestItemDto(item)),
            providerRequests: horecaRequest.providerRequests.map(
                (pR: ProviderRequest & { items: ProviderRequestItem[] }) => ({
                    ...pR,
                    cover: pR.items.length / horecaRequest.items.length,
                })
            ),
            images: (images[id] || []).map(image => image.image),
        })
    }

    async findAllAndCount(
        auth: AuthInfoDto,
        paginate: Partial<PaginateValidateType<HorecaRequestSearchDto>> = {}
    ): Promise<[HorecaRequestDto[], number]> {
        const { status } = paginate.search

        const where = {
            userId: auth.id,
            status,
        }

        const horecaRequests = await this.horecaRequestsRep.findManyWithItems({
            where,
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
            horecaRequests.map(p => p.id)
        )

        const data = horecaRequests.map(
            p =>
                new HorecaRequestDto({
                    ...p,
                    items: p.items.map(item => new HorecaRequestItemDto(item)),
                    images: (images[p.id] || []).map(image => image.image),
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
                    items: p.items.map(item => new HorecaRequestItemDto(item)),
                    images: (images[p.id] || []).map(image => image.image),
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

        horecaRequest.providerRequests.map(providerRequest => {
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
    }

    async validateRequestsOnReview() {
        // TODO: Argument `where` of type HorecaRequestWhereUniqueInput needs at least one of `id` arguments.
        // 12 hours after second notification
        const hours84Ago = dayjs().add(-3, 'day').toDate()
        await this.horecaRequestsRep.update({
            where: {
                status: HorecaRequestStatus.Active,
                deliveryTime: { lt: hours84Ago },
                providerRequests: {
                    some: {
                        OR: [
                            {
                                status: ProviderRequestStatus.Finished,
                                providerRequestReview: {
                                    is: null,
                                },
                            },
                            {
                                status: ProviderRequestStatus.Finished,
                                providerRequestReview: {
                                    isDelivered: 1,
                                    isSuccessfully: 1,
                                },
                            },
                        ],
                    },
                },
            } as Prisma.HorecaRequestWhereUniqueInput,
            data: {
                status: HorecaRequestStatus.CompletedSuccessfully,
            },
        })

        await this.horecaRequestsRep.update({
            where: {
                status: HorecaRequestStatus.Active,
                deliveryTime: { lt: hours84Ago },
                providerRequests: {
                    some: {
                        status: ProviderRequestStatus.Finished,
                        providerRequestReview: {
                            OR: [
                                {
                                    isDelivered: 0,
                                },
                                {
                                    isSuccessfully: 1,
                                },
                            ],
                        },
                    },
                },
            } as Prisma.HorecaRequestWhereUniqueInput,
            data: {
                status: HorecaRequestStatus.CompletedUnsuccessfully,
            },
        })
    }

    // Cron
    async pastRequests() {
        const now = dayjs().format(DB_DATE_FORMAT)

        // CompletedUnsuccessfully
        // no provider requests untill acceptUntill passed
        // set horecaRequest.status to CompletedUnsuccessfully
        await this.horecaRequestsRep.pastHorecaRequestsWithoutProviderOnes()

        // No сhosen provider request until deliveryTime passed
        // set horecaRequest.status to CompletedUnsuccessfully
        // set providerRequest.status to Canceled
        await this.horecaRequestsRep.pastHorecaRequestsSetStatuses(
            HorecaRequestStatus.Pending,
            HorecaRequestStatus.CompletedUnsuccessfully,
            ProviderRequestStatus.Pending,
            ProviderRequestStatus.Canceled,
            now
        )

        // Chosen provider request, deliveryTime passed
        // set horecaRequest.status to Finished
        // set providerRequest.status to Finished for chosen one and Canceled for others
        await this.horecaRequestsRep.pastHorecaRequestsSetStatuses(
            HorecaRequestStatus.Active,
            HorecaRequestStatus.Active,
            ProviderRequestStatus.Active,
            ProviderRequestStatus.Finished,
            now
        )
        await this.horecaRequestsRep.pastHorecaRequestsSetStatuses(
            HorecaRequestStatus.Active,
            HorecaRequestStatus.Active,
            ProviderRequestStatus.Pending,
            ProviderRequestStatus.Canceled,
            now
        )
        return true
    }

    async sendReviewNotification() {
        await this.sendFirstReviewNotification()

        await this.sendSecondReviewNotification()

        await this.validateRequestsOnReview()

        return true
    }
}
