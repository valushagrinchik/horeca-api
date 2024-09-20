import { Body, Controller, Get, Param, Post } from '@nestjs/common'
import { ApiOperation, ApiTags } from '@nestjs/swagger'
import { AuthUser } from '../system/utils/auth/decorators/auth.decorator'
import { UserRole } from '@prisma/client'
import { HorecaRequestTemplateDto } from './dto/horecaRequest.template.dto'
import { RequestDecorator } from '../system/utils/swagger/decorators'
import { HorecaRequestTemplateCreateDto } from './dto/horecaRequest.template.create.dto'
import { HorecaRequestsTemplateService } from './services/horecaRequests.template.service'

@AuthUser(UserRole.Horeca)
@Controller('horeca/requests/template')
@ApiTags('HorecaRequests Template')
export class HorecaRequestsTemplateController {
    constructor(private readonly service: HorecaRequestsTemplateService) {}

    @Post()
    @ApiOperation({ summary: 'Create template of products(categories) set proposal required for HoReCa to use later' })
    @RequestDecorator(HorecaRequestTemplateDto, HorecaRequestTemplateCreateDto)
    async createTemplate(@Body() dto: HorecaRequestTemplateCreateDto) {
        return this.service.createTemplate(dto)
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get template of products(categories) set proposal required for HoReCa' })
    @RequestDecorator(HorecaRequestTemplateDto)
    async getTemplate(@Param('id') id: number) {
        return this.service.getTemplate(+id)
    }
}
