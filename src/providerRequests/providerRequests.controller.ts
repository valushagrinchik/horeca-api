import { Body, Controller, Get, Param, Post, Put } from '@nestjs/common'
import { ApiOperation, ApiTags } from '@nestjs/swagger'
import { AuthUser, AuthParamDecorator } from '../auth/decorators'
import { UserRole } from '@prisma/client'
import { AuthInfoDto } from '../auth/dto/auth.info.dto'
import {
    PaginateValidateType,
    RequestDecorator,
    RequestPaginatedDecorator,
    RequestPaginatedValidateParamsDecorator,
} from '../system/utils/swagger/decorators'
import { ProviderRequestsService } from './services/providerRequests.service'
import { ProviderRequestCreateDto } from './dto/providerRequest.create.dto'
import { ProviderRequestDto } from './dto/providerRequest.dto'
import { SuccessDto } from '../system/utils/dto/success.dto'
import { HorecaRequestProviderStatusDto } from './dto/horecaRequest.providerStatus.dto'
import { ProviderHorecaRequestSearchDto } from './dto/provider.horecaRequest.search.dto'
import { PaginatedDto } from '../system/utils/dto/paginated.dto'
import { ProviderRequestSearchDto } from './dto/providerRequest.search.dto'
import { HorecaRequestDto } from '../horecaRequests/dto/horecaRequest.dto'

@AuthUser(UserRole.Provider)
@Controller('provider/requests')
@ApiTags('ProviderRequests')
export class ProviderRequestsController {
    constructor(private readonly service: ProviderRequestsService) {}

    @Get('income')
    @RequestPaginatedDecorator(HorecaRequestDto, ProviderHorecaRequestSearchDto, null, null, 'createdAt/cover|ASC/DESC')
    @ApiOperation({
        summary:
            'Список запросов хореки, соответствующих выбранным категориям профиля поставщика. Роль пользователя: Поставщик',
    })
    async incomeHorecaRequests(
        @AuthParamDecorator() auth: AuthInfoDto,
        @RequestPaginatedValidateParamsDecorator<ProviderHorecaRequestSearchDto>({
            search: ProviderHorecaRequestSearchDto,
        })
        paginate: PaginateValidateType<ProviderHorecaRequestSearchDto>
    ) {
        const [data, total] = await this.service.findHorecaRequests(auth, paginate)
        return new PaginatedDto<HorecaRequestDto>(data, total)
    }

    @Post('income/status')
    @RequestDecorator(SuccessDto, HorecaRequestProviderStatusDto)
    @ApiOperation({
        summary:
            'Пометить запрос хореки как просмотренный или не интересующий пользователя. Роль пользователя: Поставщик',
    })
    async setStatusForIncomeHorecaRequest(
        @AuthParamDecorator() auth: AuthInfoDto,
        @Body() dto: HorecaRequestProviderStatusDto
    ) {
        await this.service.setStatusForIncomeHorecaRequest(auth, dto)
        return new SuccessDto('ok')
    }

    @Post()
    @RequestDecorator(ProviderRequestDto, ProviderRequestCreateDto)
    @ApiOperation({ summary: 'Создать запрос на запрос хореки. Роль пользователя: Поставщик' })
    async create(@AuthParamDecorator() auth: AuthInfoDto, @Body() dto: ProviderRequestCreateDto) {
        return this.service.create(auth, dto)
    }

    @Get(':id')
    @RequestDecorator(ProviderRequestDto)
    @ApiOperation({ summary: 'Получить запрос поставщика по id. Роль пользователя: Поставщик' })
    async get(@AuthParamDecorator() auth: AuthInfoDto, @Param('id') id: number) {
        await this.service.validate(auth, +id)
        return this.service.get(+id)
    }

    @Put(':id')
    @RequestDecorator(ProviderRequestDto, ProviderRequestCreateDto)
    @ApiOperation({ summary: 'Отменить запрос поставщика. Роль пользователя: Поставщик' })
    async cancel(@AuthParamDecorator() auth: AuthInfoDto, @Param('id') id: number) {
        await this.service.validate(auth, +id)
        return this.service.cancel(+id)
    }

    @Get()
    @RequestPaginatedDecorator(ProviderRequestDto, ProviderRequestSearchDto)
    @ApiOperation({ summary: 'Получить все запросы поставщика. Роль пользователя: Поставщик' })
    async findAll(
        @AuthParamDecorator() auth: AuthInfoDto,
        @RequestPaginatedValidateParamsDecorator() paginate: PaginateValidateType<ProviderRequestSearchDto>
    ) {
        const [data, total] = await this.service.findAllAndCount(auth, paginate)
        return new PaginatedDto<ProviderRequestDto>(data, total)
    }
}
