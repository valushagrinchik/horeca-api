import { Injectable } from '@nestjs/common'
import { HorecaRequestCreateDto } from '../dto/horecaRequest.create.dto'
import { HorecaRequestDto } from '../dto/horecaRequest.dto'
import { HorecaRequestTemplateCreateDto } from '../dto/horecaRequest.template.create.dto'
import { AuthInfoDto } from '../../users/dto/auth.info.dto'
import { Prisma, UploadsLinkType } from '@prisma/client'
import { PaginateValidateType } from '../../system/utils/swagger/decorators'
import { HorecaRequestTemplateDto } from '../dto/horecaRequest.template.dto'
import { UploadsLinkService } from '../../uploads/uploads.link.service'
import { HorecaRequestItemDto } from '../dto/horecaRequest.item.dto'
import { HorecaRequestsDbService } from './horecaRequests.db.service'
import { HorecaRequestsTemplateDbService } from './horecaRequestsTemplate.db.service'
import { UsersService } from '../../users/services/users.service'

@Injectable()
export class HorecaRequestsService {
    constructor(
        private horecaRequestsRep: HorecaRequestsDbService,
        private horecaRequestsTemplateRep: HorecaRequestsTemplateDbService,
        private uploadsLinkService: UploadsLinkService,
        private usersService: UsersService
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
        const horecaRequest = await this.horecaRequestsRep.get(id)
        const images = await this.uploadsLinkService.getImages(UploadsLinkType.HorecaRequest, [horecaRequest.id])

        return new HorecaRequestDto({
            ...horecaRequest,
            items: horecaRequest.items.map(item => new HorecaRequestItemDto(item)),
            images: (images[id] || []).map(image => image.image),
        })
    }

    async createTemplate({ content, ...dto }: HorecaRequestTemplateCreateDto) {
        const proposalTemplate = await this.horecaRequestsTemplateRep.create({
            ...dto,
            content: JSON.stringify(content),
        })
        return new HorecaRequestTemplateDto(proposalTemplate)
    }

    async getTemplate(id: number) {
        const proposalTemplate = await this.horecaRequestsTemplateRep.get(id)
        return new HorecaRequestTemplateDto(proposalTemplate)
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
        const horecaRequests = await this.horecaRequestsRep.findManyWithItems(
            args
        )

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
}
