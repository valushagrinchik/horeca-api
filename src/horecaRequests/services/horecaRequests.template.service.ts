import { BadRequestException, Injectable } from '@nestjs/common'
import { HorecaRequestsTemplateDbService } from './horecaRequests.template.db.service'
import { HorecaRequestTemplateCreateDto } from '../dto/horecaRequest.template.create.dto'
import { HorecaRequestTemplateDto } from '../dto/horecaRequest.template.dto'
import { AuthInfoDto } from '../../users/dto/auth.info.dto'
import { PaginateValidateType } from '../../system/utils/swagger/decorators'
import { HorecaRequestTemplateUpdateDto } from '../dto/horecaRequest.template.update.dto'
import { ErrorDto } from '../../system/utils/dto/error.dto'
import { ErrorCodes } from '../../system/utils/enums/errorCodes.enum'

@Injectable()
export class HorecaRequestsTemplateService {
    constructor(private horecaRequestsTemplateRep: HorecaRequestsTemplateDbService) {}

    async create(auth: AuthInfoDto, { name, content }: HorecaRequestTemplateCreateDto) {
        const proposalTemplate = await this.horecaRequestsTemplateRep.create({
            user: {
                connect: { id: auth.id },
            },
            name,
            content: JSON.stringify(content),
        })
        return new HorecaRequestTemplateDto(proposalTemplate)
    }

    async find(auth: AuthInfoDto, id: number) {
        const proposalTemplate = await this.horecaRequestsTemplateRep.find({ id, userId: auth.id })
        if (!proposalTemplate) {
            throw new BadRequestException(new ErrorDto(ErrorCodes.TEMPLATE_DOES_NOT_EXISTS))
        }
        return new HorecaRequestTemplateDto(proposalTemplate)
    }

    async findAllAndCount(
        auth: AuthInfoDto,
        paginate: PaginateValidateType
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
