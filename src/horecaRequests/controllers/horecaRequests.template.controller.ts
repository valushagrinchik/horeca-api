import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common'
import { ApiOperation, ApiTags } from '@nestjs/swagger'
import { AuthUser, AuthParamDecorator } from '../../auth/decorators'
import { UserRole } from '@prisma/client'
import { HorecaRequestTemplateDto } from '../dto/horecaRequest.template.dto'
import {
    PaginateValidateType,
    RequestDecorator,
    RequestPaginatedDecorator,
    RequestPaginatedValidateParamsDecorator,
} from '../../system/utils/swagger/decorators'
import { HorecaRequestTemplateCreateDto } from '../dto/horecaRequest.template.create.dto'
import { HorecaRequestsTemplateService } from '../services/horecaRequests.template.service'
import { AuthInfoDto } from '../../auth/dto/auth.info.dto'
import { PaginatedDto } from '../../system/utils/dto/paginated.dto'
import { SuccessDto } from '../../system/utils/dto/success.dto'
import { HorecaRequestTemplateUpdateDto } from '../dto/horecaRequest.template.update.dto'

@AuthUser(UserRole.Horeca)
@Controller('horeca/requests/templates')
@ApiTags('HorecaRequests Template')
export class HorecaRequestsTemplateController {
    constructor(private readonly service: HorecaRequestsTemplateService) {}

    @Post()
    @ApiOperation({ summary: 'Создать темплейт заявки. Роль пользователя: Хорека' })
    @RequestDecorator(HorecaRequestTemplateDto, HorecaRequestTemplateCreateDto)
    async create(@AuthParamDecorator() auth: AuthInfoDto, @Body() dto: HorecaRequestTemplateCreateDto) {
        return this.service.create(auth, dto)
    }

    @Get(':id')
    @ApiOperation({ summary: 'Получить темплейт заявки. Роль пользователя: Хорека' })
    @RequestDecorator(HorecaRequestTemplateDto)
    async find(@AuthParamDecorator() auth: AuthInfoDto, @Param('id') id: number) {
        return this.service.find(auth, +id)
    }

    @Put(':id')
    @ApiOperation({ summary: 'Обновить темплейт заявки. Роль пользователя: Хорека' })
    @RequestDecorator(HorecaRequestTemplateDto)
    async update(
        @AuthParamDecorator() auth: AuthInfoDto,
        @Param('id') id: number,
        @Body() dto: HorecaRequestTemplateUpdateDto
    ) {
        return this.service.update(auth, +id, dto)
    }

    @Get()
    @ApiOperation({ summary: 'Получить все темплейты заявок. Роль пользователя: Хорека' })
    @RequestPaginatedDecorator(HorecaRequestTemplateDto)
    async findAll(
        @AuthParamDecorator() auth: AuthInfoDto,
        @RequestPaginatedValidateParamsDecorator() paginate: PaginateValidateType<Object>
    ) {
        const [data, total] = await this.service.findAllAndCount(auth, paginate)
        return new PaginatedDto(data, total)
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Удалить темплейт заявки. Роль пользователя: Хорека' })
    @RequestDecorator(SuccessDto)
    async delete(@AuthParamDecorator() auth: AuthInfoDto, @Param('id') id: number) {
        await this.service.delete(auth, +id)
        return new SuccessDto('ok')
    }
}
