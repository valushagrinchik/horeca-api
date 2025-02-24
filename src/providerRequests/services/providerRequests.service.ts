import { BadRequestException, Injectable } from '@nestjs/common'

import { AuthInfoDto } from '../../auth/dto/auth.info.dto'
import { HorecaRequestStatus, Prisma, ProviderRequestStatus, UploadsLinkType } from '@prisma/client'
import { ProviderRequestCreateDto } from '../dto/providerRequest.create.dto'
import { ProviderRequestDto } from '../dto/providerRequest.dto'
import { UploadsLinkService } from '../../uploads/uploads.link.service'
import { ProviderRequestsDbService } from './providerRequests.db.service'
import { ProviderRequestItemDto } from '../dto/providerRequestItem.dto'
import { PaginateValidateType } from '../../system/utils/swagger/decorators'
import { UsersService } from '../../users/users.service'
import { HorecaRequestsService } from '../../horecaRequests/services/horecaRequests.service'
import { HorecaRequestProviderStatusDto } from '../dto/horecaRequest.providerStatus.dto'
import { HorecaRequestProviderStatusDbService } from './horecaRequest.providerStatus.db.service'
import { ProviderHorecaRequestSearchDto } from '../dto/provider.horecaRequest.search.dto'
import { HorecaRequestDto } from '../../horecaRequests/dto/horecaRequest.dto'
import * as dayjs from 'dayjs'
import { DB_DATE_FORMAT } from '../../system/utils/constants'
import { ErrorDto } from '../../system/utils/dto/error.dto'
import { ErrorCodes } from '../../system/utils/enums/errorCodes.enum'
import { NotificationWsGateway } from '../../notifications/notification.ws.gateway'
import { NotificationEvents } from '../../system/utils/enums/websocketEvents.enum'
import { ProviderRequestSearchDto } from '../dto/providerRequest.search.dto'
import { Categories } from '../../system/utils/enums'
import { isNil, omit } from 'lodash'
import { RequestsMatcherDbService } from '../../system/shared/requestsMatcher/requestsMatcher.db.service'

@Injectable()
export class ProviderRequestsService {
    constructor(
        private providerRequestsRep: ProviderRequestsDbService,
        private uploadsLinkService: UploadsLinkService,
        private usersService: UsersService,
        private horecaRequestService: HorecaRequestsService,
        private horecaRequestProviderStatusRep: HorecaRequestProviderStatusDbService,
        private notificationWsGateway: NotificationWsGateway,
        private requestsMatcherService: RequestsMatcherDbService
    ) {}

    async validate(auth: AuthInfoDto, id: number) {
        const pRequest = await this.providerRequestsRep.getRawById(auth.id, id)
        if (!pRequest) {
            throw new BadRequestException(new ErrorDto(ErrorCodes.ITEM_NOT_FOUND))
        }
    }

    async getHorecaRequest(auth: AuthInfoDto, id: number): Promise<HorecaRequestDto> {
        const now = dayjs().format(DB_DATE_FORMAT)
        const provider = await this.usersService.get(auth)
        const categories = provider.profile.categories as Categories[]
        const horecaRequest = await this.horecaRequestService.get(id, {
            items: {
                where: {
                    category: { in: categories },
                },
            },
        })
        if (horecaRequest.items.length == 0) {
            throw new BadRequestException(new ErrorDto(ErrorCodes.FORBIDDEN_ACTION))
        }
        if (horecaRequest.acceptUntill < new Date(now)) {
            throw new BadRequestException(new ErrorDto(ErrorCodes.FORBIDDEN_ACTION))
        }

        return horecaRequest
    }

    async findHorecaRequests(
        auth: AuthInfoDto,
        paginate: Partial<PaginateValidateType<ProviderHorecaRequestSearchDto>> = {}
    ): Promise<[HorecaRequestDto[], number]> {
        const now = dayjs().format(DB_DATE_FORMAT)
        const provider = await this.usersService.get(auth)
        const categories = provider.profile.categories as Categories[]
        const { hiddenAndViewed, category } = paginate.search

        if (category && !categories.includes(category)) {
            throw new BadRequestException(new ErrorDto(ErrorCodes.FORBIDDEN_ACTION))
        }

        const categoriesFilter = category ? [category] : categories

        const where: Prisma.ProviderHorecaRequestsCoverViewWhereInput = {
            providerId: auth.id,
            horecaRequest: {
                is: {
                    categories: {
                        hasSome: categoriesFilter,
                    },
                    status: HorecaRequestStatus.Pending,
                    ...(hiddenAndViewed === true
                        ? { horecaRequestProviderStatus: { isNot: null } }
                        : hiddenAndViewed === false
                          ? { horecaRequestProviderStatus: { is: null } }
                          : {}),
                    acceptUntill: {
                        // TODO: check date
                        gte: new Date(now),
                    },
                },
            },
        }

        const data = await this.requestsMatcherService.findHorecaRequests({
            where,
            include: {
                horecaRequest: {
                    include: {
                        items: {
                            where: {
                                category: { in: categories },
                            },
                        },
                        horecaRequestProviderStatus: {
                            where: {
                                providerId: auth.id,
                            },
                        },
                    },
                },
            },
            orderBy: {
                [paginate.sort.field]: paginate.sort.order,
            },
            take: paginate.limit,
            skip: paginate.offset,
        })

        const total = await this.requestsMatcherService.countHorecaRequests(where)
        return [data.map(item => ({ ...item.horecaRequest, cover: item.cover })), total]
    }

    async setStatusForIncomeHorecaRequest(auth: AuthInfoDto, dto: HorecaRequestProviderStatusDto) {
        await this.horecaRequestProviderStatusRep.upsert({
            ...dto,
            providerId: auth.id,
        })
    }

    async create(auth: AuthInfoDto, { horecaRequestId, items, ...dto }: ProviderRequestCreateDto) {
        const horecaRequest = await this.horecaRequestService.getRawById(horecaRequestId)

        if (horecaRequest.status != HorecaRequestStatus.Pending) {
            throw new BadRequestException(new ErrorDto(ErrorCodes.FORBIDDEN_ACTION))
        }

        const providerRequest = await this.providerRequestsRep.create({
            ...dto,
            user: { connect: { id: auth.id } },
            horecaRequest: { connect: { id: horecaRequest.id } },
            items: {
                createMany: {
                    data: items.map(item => omit(item, ['imageIds'])),
                },
            },
        })

        const itemIdsMap = new Map(providerRequest.items.map(item => [item.horecaRequestItemId, item.id]))

        Promise.all(
            items
                .filter(item => item.imageIds)
                .map(item =>
                    this.uploadsLinkService.createMany(
                        UploadsLinkType.ProviderRequestItem,
                        itemIdsMap[item.horecaRequestItemId],
                        item.imageIds
                    )
                )
        )

        this.notificationWsGateway.sendNotification(horecaRequest.userId, NotificationEvents.PROVIDER_REQUEST_CREATED, {
            data: {
                hRequestId: horecaRequest.id,
                pRequestId: providerRequest.id,
            },
        })

        return this.get(providerRequest.id)
    }

    async createByUser({ horecaRequestId, items, ...dto }: ProviderRequestCreateDto, userId: number) {
        const providerRequest = await this.providerRequestsRep.create({
            ...dto,
            user: { connect: { id: userId } },
            horecaRequest: { connect: { id: horecaRequestId } },
            items: {
                createMany: {
                    data: items,
                },
            },
        })
        return providerRequest
    }

    async cancel(id: number) {
        const pRequest = await this.providerRequestsRep.get(id)
        if (pRequest.status == ProviderRequestStatus.Active) {
            await this.horecaRequestService.cancelProviderRequest(
                {
                    horecaRequestId: pRequest.horecaRequestId,
                    providerRequestId: id,
                },
                false
            )
        } else {
            await this.providerRequestsRep.update(id, {
                status: ProviderRequestStatus.Canceled,
            })
        }
    }

    async findAllAndCount(
        auth: AuthInfoDto,
        paginate: Partial<PaginateValidateType<ProviderRequestSearchDto>> = {}
    ): Promise<[ProviderRequestDto[], number]> {
        const { status } = paginate.search
        const where = { userId: auth.id, status }
        const providerRequests = await this.providerRequestsRep.findAll({
            where,
            orderBy: {
                [paginate.sort.field]: paginate.sort.order,
            },
            take: paginate.limit,
            skip: paginate.offset,
            include: {
                items: true,
                horecaRequest: true,
            },
        })
        const total = await this.providerRequestsRep.count({
            where,
        })

        const sourceIds = providerRequests.map(p => p.items.map(item => item.id)).flat()

        const images = await this.uploadsLinkService.getImages(UploadsLinkType.ProviderRequestItem, sourceIds)

        const data = providerRequests.map(
            providerRequest =>
                new ProviderRequestDto({
                    ...providerRequest,
                    items: providerRequest.items.map(item => {
                        return new ProviderRequestItemDto({
                            ...item,
                            images: (images[item.id] || []).map(image => image.image),
                        })
                    }),
                    horecaRequest: new HorecaRequestDto(providerRequest.horecaRequest),
                })
        )
        return [data, total]
    }

    async get(id: number) {
        const providerRequest = await this.providerRequestsRep.get(id)

        const images = await this.uploadsLinkService.getImages(
            UploadsLinkType.ProviderRequestItem,
            providerRequest.items.map(item => item.id)
        )

        return new ProviderRequestDto({
            ...providerRequest,
            items: providerRequest.items.map(item => {
                return new ProviderRequestItemDto({ ...item, images: (images[id] || []).map(image => image.image) })
            }),
            horecaRequest: new HorecaRequestDto(providerRequest.horecaRequest),
        })
    }
}
