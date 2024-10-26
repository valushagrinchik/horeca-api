import { Injectable } from '@nestjs/common'
import { HorecaRequestCreateDto } from '../dto/horecaRequest.create.dto'
import { HorecaRequestDto } from '../dto/horecaRequest.dto'
import { AuthInfoDto } from '../../users/dto/auth.info.dto'
import { Prisma, UploadsLinkType } from '@prisma/client'
import { PaginateValidateType } from '../../system/utils/swagger/decorators'
import { UploadsLinkService } from '../../uploads/uploads.link.service'
import { HorecaRequestItemDto } from '../dto/horecaRequest.item.dto'
import { HorecaRequestsDbService } from './horecaRequests.db.service'
import { HorecaRequestApproveProviderRequestDto } from '../dto/horecaRequest.approveProviderRequest.dto'
import { HorecaRequestWithProviderRequestDto } from '../dto/horecaRequest.withProviderRequests.dto'
import { HorecaRequestSearchDto } from '../../providerRequests/dto/horecaRequest.search.dto'

@Injectable()
export class HorecaRequestsService {
    constructor(
        private horecaRequestsRep: HorecaRequestsDbService,
        private uploadsLinkService: UploadsLinkService
    ) {}

    async create(auth: AuthInfoDto, { imageIds, ...dto }: HorecaRequestCreateDto) {
        const horecaRequest = await this.horecaRequestsRep.create({
            ...dto,
            user: {
                connect: {
                    id: auth.id,
                },
            },
            items: {
                create: dto.items,
            },
        })

        if (imageIds) {
            await this.uploadsLinkService.createMany(UploadsLinkType.HorecaRequest, horecaRequest.id, imageIds)
        }

        return this.get(auth, horecaRequest.id)
    }

    async get(auth: AuthInfoDto, id: number) {
        const horecaRequest = await this.horecaRequestsRep.get(auth.id, id)
        const images = await this.uploadsLinkService.getImages(UploadsLinkType.HorecaRequest, [horecaRequest.id])

        return new HorecaRequestWithProviderRequestDto({
            ...horecaRequest,
            items: horecaRequest.items.map(item => new HorecaRequestItemDto(item)),
            providerRequests: horecaRequest.providerRequests.map(pR => ({
                ...pR,
                cover: pR.items.length / horecaRequest.items.length,
            })),
            images: (images[id] || []).map(image => image.image),
        })
    }

    async findAllAndCount(
        auth: AuthInfoDto,
        paginate: Partial<PaginateValidateType> = {}
    ): Promise<[HorecaRequestDto[], number]> {
        const horecaRequests = await this.horecaRequestsRep.findManyWithItems({
            where: {
                userId: auth.id,
            },
            orderBy: {
                createdAt: 'desc',
                [paginate.sort.field]: paginate.sort.order,
            },
            take: paginate.limit,
            skip: paginate.offset,
        })

        const total = await this.horecaRequestsRep.count({
            where: {
                userId: auth.id,
            },
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

    async approveProviderRequest(auth: AuthInfoDto, dto: HorecaRequestApproveProviderRequestDto) {
        await this.horecaRequestsRep.approveProviderRequest(auth.id, dto)
    }

    async isReadyForChat(auth: AuthInfoDto, id: number) {
        const request = await this.horecaRequestsRep.get(auth.id, id)
        return !!request.activeProviderRequest
    }
}
