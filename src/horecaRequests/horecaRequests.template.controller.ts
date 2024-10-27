import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common'
import { ApiOperation, ApiTags } from '@nestjs/swagger'
import { AuthUser } from '../system/utils/auth/decorators/auth.decorator'
import { UserRole } from '@prisma/client'
import { HorecaRequestTemplateDto } from './dto/horecaRequest.template.dto'
import {
    PaginateValidateType,
    RequestDecorator,
    RequestPaginatedDecorator,
    RequestPaginatedValidateParamsDecorator,
} from '../system/utils/swagger/decorators'
import { HorecaRequestTemplateCreateDto } from './dto/horecaRequest.template.create.dto'
import { HorecaRequestsTemplateService } from './services/horecaRequests.template.service'
import { AuthParamDecorator } from '../system/utils/auth/decorators/auth.param.decorator'
import { AuthInfoDto } from '../users/dto/auth.info.dto'
import { PaginatedDto } from '../system/utils/dto/paginated.dto'
import { SuccessDto } from '../system/utils/dto/success.dto'
import { HorecaRequestTemplateUpdateDto } from './dto/horecaRequest.template.update.dto'

@AuthUser(UserRole.Horeca)
@Controller('horeca/requests/templates')
@ApiTags('HorecaRequests Template')
export class HorecaRequestsTemplateController {
    constructor(private readonly service: HorecaRequestsTemplateService) {}

    @Post()
    @ApiOperation({ summary: 'Create template of products(categories) set proposal required for HoReCa to use later' })
    @RequestDecorator(HorecaRequestTemplateDto, HorecaRequestTemplateCreateDto)
    async create(@AuthParamDecorator() auth: AuthInfoDto, @Body() dto: HorecaRequestTemplateCreateDto) {
        return this.service.create(auth, dto)
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get template of products(categories) set proposal required for HoReCa' })
    @RequestDecorator(HorecaRequestTemplateDto)
    async find(@AuthParamDecorator() auth: AuthInfoDto, @Param('id') id: number) {
        return this.service.find(auth, +id)
    }

    @Put(':id')
    @ApiOperation({ summary: 'Update template' })
    @RequestDecorator(HorecaRequestTemplateDto)
    async update(
        @AuthParamDecorator() auth: AuthInfoDto,
        @Param('id') id: number,
        @Body() dto: HorecaRequestTemplateUpdateDto
    ) {
        return this.service.update(auth, +id, dto)
    }

    @Get()
    @ApiOperation({ summary: 'Get all templates' })
    @RequestPaginatedDecorator(HorecaRequestTemplateDto)
    async findAll(
        @AuthParamDecorator() auth: AuthInfoDto,
        @RequestPaginatedValidateParamsDecorator() paginate: PaginateValidateType
    ) {
        const [data, total] = await this.service.findAllAndCount(auth, paginate)
        return new PaginatedDto(data, total)
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete template' })
    @RequestDecorator(SuccessDto)
    async delete(@AuthParamDecorator() auth: AuthInfoDto, @Param('id') id: number) {
        await this.service.delete(auth, +id)
        return new SuccessDto('ok')
    }
}
