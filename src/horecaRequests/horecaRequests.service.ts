import { Injectable } from '@nestjs/common'
import { HorecaRequestCreateDto } from './dto/horecaRequest.create.dto'
import { HorecaRequestDto } from './dto/horecaRequest.dto'
import { HorecaRequestTemplateCreateDto } from './dto/horecaRequest.template.create.dto'
import { AuthInfoDto } from '../users/dto/auth.info.dto'
import { UploadsLinkType } from '@prisma/client'
import { PaginateValidateType } from '../system/utils/swagger/decorators'
import { HorecaRequestTemplateDto } from './dto/horecaRequest.template.dto'
import { UploadsLinkService } from '../uploads/uploads.link.service'
import { HorecaRequestItemDto } from './dto/horecaRequest.item.dto'
import { DatabaseService } from '../system/database/database.service'

@Injectable()
export class HorecaRequestsService {
    constructor(
        private prisma: DatabaseService,
        private uploadsLinkService: UploadsLinkService
    ) {}

    async create(auth: AuthInfoDto, { imageIds, ...dto }: HorecaRequestCreateDto) {
        const profile = await this.prisma.profile.findUnique({ where: { userId: auth.id } })

        const horecaRequest = await this.prisma.horecaRequest.create({
            data: {
                ...dto,
                profileId: profile.id,
                items: {
                    create: dto.items,
                },
            },
        })

        if (imageIds) {
            await this.uploadsLinkService.createMany(UploadsLinkType.HorecaRequest, horecaRequest.id, imageIds)
        }

        return this.get(auth, horecaRequest.id)
    }

    async get(auth: AuthInfoDto, id: number) {
        const horecaRequest = await this.prisma.horecaRequest.findUnique({ where: { id }, include: { items: true } })
        const images = await this.uploadsLinkService.getImages(UploadsLinkType.HorecaRequest, [horecaRequest.id])

        return new HorecaRequestDto({
            ...horecaRequest,
            items: horecaRequest.items.map(item => new HorecaRequestItemDto(item)),
            images: images[id].map(image => image.image),
        })
    }

    async createTemplate({ content, ...dto }: HorecaRequestTemplateCreateDto) {
        const proposalTemplate = await this.prisma.horecaRequestTemplate.create({
            data: {
                ...dto,
                content: JSON.stringify(content),
            },
        })
        return new HorecaRequestTemplateDto(proposalTemplate)
    }

    async getTemplate(id: number) {
        const proposalTemplate = await this.prisma.horecaRequestTemplate.findUnique({
            where: { id },
        })
        return new HorecaRequestTemplateDto(proposalTemplate)
    }

    async findForProvider(auth: AuthInfoDto, paginate: Partial<PaginateValidateType> = {}) {
        const now = new Date()
        const provider = await this.prisma.user.findUnique({ where: { id: auth.id }, include: { profile: true } })
        const categories = provider.profile.categories
        const horecaRequests = await this.prisma.horecaRequest.findMany({
            include: { items: true },
            where: {
                items: {
                    some: {
                        category: { in: categories },
                    },
                },
                //TODO: check only day not time
                acceptUntill: {
                    gte: now,
                },
            },
            orderBy: {
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
                    images: images[p.id].map(image => image.image),
                })
        )
    }
}
