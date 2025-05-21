import { BadRequestException, Injectable } from '@nestjs/common'
import { HorecaRequestsTemplateDbService } from './horecaRequests.template.db.service'
import { HorecaRequestTemplateCreateDto } from '../dto/horecaRequest.template.create.dto'
import { HorecaRequestTemplateDto } from '../dto/horecaRequest.template.dto'
import { AuthInfoDto } from '../../auth/dto/auth.info.dto'
import { HorecaRequestTemplateUpdateDto } from '../dto/horecaRequest.template.update.dto'
import { ErrorDto, ErrorCodes, PaginateValidateType } from '@/shared/utils'
import { UploadsLinkService } from '@/uploads/uploads.link.service'
import { UploadsLinkType } from '@prisma/client'

@Injectable()
export class HorecaRequestsTemplateService {
    constructor(
        private horecaRequestsTemplateRep: HorecaRequestsTemplateDbService,
        private uploadsLinkService: UploadsLinkService
    ) {}

    async create(auth: AuthInfoDto, { name, content }: HorecaRequestTemplateCreateDto) {
        const template = await this.horecaRequestsTemplateRep.create({
            user: {
                connect: { id: auth.id },
            },
            name,
            content: JSON.stringify(content),
        })
        if (content.imageIds?.length) {
            await this.uploadsLinkService.createMany(
                UploadsLinkType.HorecaRequestTemplate,
                template.id,
                content.imageIds
            )
        }
        return new HorecaRequestTemplateDto(template)
    }

    async find(auth: AuthInfoDto, id: number) {
        const template = await this.horecaRequestsTemplateRep.find({ id, userId: auth.id })
        if (!template) {
            throw new BadRequestException(new ErrorDto(ErrorCodes.TEMPLATE_DOES_NOT_EXISTS))
        }

        const images = await this.uploadsLinkService.getImages(UploadsLinkType.HorecaRequestTemplate, [template.id])

        return new HorecaRequestTemplateDto({ ...template, images: images[template.id] })
    }

    async findAllAndCount(
        auth: AuthInfoDto,
        paginate: PaginateValidateType<Object>
    ): Promise<[HorecaRequestTemplateDto[], number]> {
        const where = {
            userId: auth.id,
        }
        const data = await this.horecaRequestsTemplateRep.findAll({
            where,
            orderBy: {
                createdAt: 'desc',
                [paginate.sort.field]: paginate.sort.order,
            },
            take: paginate.limit,
            skip: paginate.offset,
        })
        const total = await this.horecaRequestsTemplateRep.count({ where })
        return [data.map(t => new HorecaRequestTemplateDto(t)), total]
    }

    async delete(auth: AuthInfoDto, id: number) {
        return this.horecaRequestsTemplateRep.delete({ where: { id, userId: auth.id } })
    }

    async update(auth: AuthInfoDto, id: number, { name, content }: HorecaRequestTemplateUpdateDto) {
        const proposalTemplate = await this.horecaRequestsTemplateRep.update({
            where: {
                id,
                userId: auth.id,
            },
            data: {
                name,
                content: JSON.stringify(content),
            },
        })
        return new HorecaRequestTemplateDto(proposalTemplate)
    }
}
