import { Body, Controller, Get, Param, Post } from '@nestjs/common'
import { ApiOperation, ApiTags } from '@nestjs/swagger'
import { HorecaRequestCreateDto } from './dto/horecaRequest.create.dto'
import { AuthUser } from '../utils/auth/decorators/auth.decorator'
import { UserRole } from '@prisma/client'
import { HorecaRequestDto } from './dto/horecaRequest.dto'
import { HorecaRequestTemplateDto } from './dto/horecaRequest.template.dto'
import { AuthParamDecorator } from '../utils/auth/decorators/auth.param.decorator'
import { AuthInfoDto } from '../users/dto/auth.info.dto'
import { PaginateValidateType, RequestDecorator, RequestPaginatedDecorator, RequestPaginatedValidateParamsDecorator } from '../utils/swagger/decorators'
import { HorecaRequestsService } from './HorecaRequests.service'
import { HorecaRequestTemplateCreateDto } from './dto/horecaRequest.template.create.dto'

@AuthUser(UserRole.Horeca)
@Controller('requests/horeca')
@ApiTags('HorecaRequests')
export class HorecaRequestsController {
    constructor(private readonly service: HorecaRequestsService) {}

    @Post()
    @ApiOperation({ summary: 'Create products(categories) set proposal required for HoReCa' })
    @RequestDecorator(HorecaRequestDto, HorecaRequestCreateDto)
    async create(@AuthParamDecorator() auth: AuthInfoDto, @Body() dto: HorecaRequestCreateDto) {
        return this.service.create(auth, dto)
    }

    @Post('template')
    @ApiOperation({ summary: 'Create template of products(categories) set proposal required for HoReCa to use later' })
    @RequestDecorator(HorecaRequestTemplateDto, HorecaRequestTemplateCreateDto)
    async createTemplate(@Body() dto: HorecaRequestTemplateCreateDto) {
        return this.service.createTemplate(dto)
    }

    @Get('template/:id')
    @ApiOperation({ summary: 'Get template of products(categories) set proposal required for HoReCa' })
    @RequestDecorator(HorecaRequestTemplateDto)
    async getTemplate(@Param('id') id: number) {
        return this.service.getTemplate(id)
    }



    @AuthUser(UserRole.Provider)
    @RequestPaginatedDecorator(HorecaRequestDto)
    @ApiOperation({ summary: "List of HoReCa proposals that matches with provider's offers" })
    async findForProvider(
        @AuthParamDecorator() auth: AuthInfoDto,
        @RequestPaginatedValidateParamsDecorator() paginate: PaginateValidateType
    ) {
        return this.service.findForProvider(auth, paginate)
    }
}
