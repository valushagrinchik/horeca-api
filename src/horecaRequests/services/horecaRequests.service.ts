import { Injectable } from '@nestjs/common'
import { HorecaRequestCreateDto } from '../dto/horecaRequest.create.dto'
import { HorecaRequestDto } from '../dto/horecaRequest.dto'
import { AuthInfoDto } from '../../users/dto/auth.info.dto'
import { ChatType, Prisma, UploadsLinkType } from '@prisma/client'
import { PaginateValidateType } from '../../system/utils/swagger/decorators'
import { UploadsLinkService } from '../../uploads/uploads.link.service'
import { HorecaRequestItemDto } from '../dto/horecaRequest.item.dto'
import { HorecaRequestsDbService } from './horecaRequests.db.service'
import { HorecaRequestApproveProviderRequestDto } from '../dto/horecaRequest.approveProviderRequest.dto'
import { HorecaRequestWithProviderRequestDto } from '../dto/horecaRequest.withProviderRequests.dto'
import { ChatService } from 'src/chat/services/chat.service'

@Injectable()
export class HorecaRequestsService {
    constructor(
        private horecaRequestsRep: HorecaRequestsDbService,
        private uploadsLinkService: UploadsLinkService,
        private chatService: ChatService
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

    async findAll(auth: AuthInfoDto, paginate: Partial<PaginateValidateType> = {}) {
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

    async approveProviderRequest(auth: AuthInfoDto, dto: HorecaRequestApproveProviderRequestDto) {
        await this.horecaRequestsRep.approveProviderRequest(auth.id, dto)
        await this.chatService.createChat(auth, {
            sourceId: dto.horecaRequestId,
            type: ChatType.Order,
            opponentId: dto.providerRequestId,
        })
    }
}
