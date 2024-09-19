import { Injectable } from '@nestjs/common'

import { AuthInfoDto } from '../../users/dto/auth.info.dto'
import { UploadsLinkType } from '@prisma/client'
import { ProviderRequestCreateDto } from '../dto/providerRequest.create.dto'
import { ProviderRequestDto } from '../dto/providerRequest.dto'
import { UploadsLinkService } from '../../uploads/uploads.link.service'
import { ProviderRequestsDbService } from './providerRequests.db.service'
import { ProviderRequestItemDto } from '../dto/providerRequestItem.dto'
import { PaginateValidateType } from '../../system/utils/swagger/decorators'
import { UsersService } from '../../users/services/users.service'
import { HorecaRequestsService } from '../../horecaRequests/services/horecaRequests.service'
import { HorecaRequestProviderStatusDto } from '../dto/horecaRequest.providerStatus.dto'
import { HorecaRequestProviderStatusDbService } from './horecaRequest.providerStatus.db.service'
import { HorecaRequestSearchDto } from '../dto/horecaRequest.search.dto'

@Injectable()
export class ProviderRequestsService {
    constructor(
        private providerRequestsRep: ProviderRequestsDbService,
        private uploadsLinkService: UploadsLinkService,
        private usersService: UsersService,
        private horecaRequestService: HorecaRequestsService,
        private horecaRequestProviderStatusRep: HorecaRequestProviderStatusDbService
    ) {}

    async findHorecaRequests(auth: AuthInfoDto, paginate: Partial<PaginateValidateType<HorecaRequestSearchDto>> = {}) {
        const now = new Date()
        const provider = await this.usersService.get(auth)
        const categories = provider.profile.categories
        const filter = paginate.search

        const data = await this.horecaRequestService.findByCondition({
            where: {
                items: {
                    some: {
                        category: { in: categories },
                    },
                },
                horecaRequestProviderStatus: !filter.inactive
                    ? {
                          is: null,
                      }
                    : { isNot: null },
                //TODO: check only day not time
                acceptUntill: {
                    gte: now,
                },
            },
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
            orderBy: {
                [paginate.sort.field]: paginate.sort.order,
            },
            take: paginate.limit,
            skip: paginate.offset,
        })

        return data
    }

    async setStatus(auth: AuthInfoDto, dto: HorecaRequestProviderStatusDto) {
        await this.horecaRequestProviderStatusRep.upsert({
            ...dto,
            providerId: auth.id,
        })
    }

    async create(auth: AuthInfoDto, { horecaRequestId, items, ...dto }: ProviderRequestCreateDto) {
        const providerRequest = await this.providerRequestsRep.create({
            ...dto,
            user: { connect: { id: auth.id } },
            horecaRequest: { connect: { id: horecaRequestId } },
            items: {
                createMany: {
                    data: items,
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

        return this.get(auth, providerRequest.id)
    }

    async findAll(auth: AuthInfoDto, paginate: Partial<PaginateValidateType> = {}) {
        return this.providerRequestsRep.findAll({
            where: {
                userId: auth.id,
            },
            orderBy: {
                [paginate.sort.field]: paginate.sort.order,
            },
            take: paginate.limit,
            skip: paginate.offset,
        })
    }

    async get(auth: AuthInfoDto, id: number) {
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
        })
    }

    async approveByHoreca(auth: AuthInfoDto, id: number) {
        await this.providerRequestsRep.approveOnlyOne(id)
    }
}
