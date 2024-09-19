import { Injectable } from '@nestjs/common'
import { HorecaRequestsTemplateDbService } from './horecaRequests.template.db.service'
import { HorecaRequestTemplateCreateDto } from '../dto/horecaRequest.template.create.dto'
import { HorecaRequestTemplateDto } from '../dto/horecaRequest.template.dto'

@Injectable()
export class HorecaRequestsTemplateService {
    constructor(private horecaRequestsTemplateRep: HorecaRequestsTemplateDbService) {}

    async createTemplate({ name, content }: HorecaRequestTemplateCreateDto) {
        const proposalTemplate = await this.horecaRequestsTemplateRep.create({
            name,
            content: JSON.stringify(content),
        })
        return new HorecaRequestTemplateDto(proposalTemplate)
    }

    async getTemplate(id: number) {
        const proposalTemplate = await this.horecaRequestsTemplateRep.get(id)
        return new HorecaRequestTemplateDto(proposalTemplate)
    }
}
