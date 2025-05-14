import { Body, Controller, Get, Param, Post } from '@nestjs/common'
import { ApiOperation, ApiTags } from '@nestjs/swagger'
import { HorecaRequestCreateDto } from '../dto/horecaRequest.create.dto'
import { AuthUser, AuthParamDecorator } from '../../auth/decorators'
import { UserRole } from '@prisma/client'
import { HorecaRequestDto } from '../dto/horecaRequest.dto'
import { AuthInfoDto } from '../../auth/dto/auth.info.dto'
import {
    PaginateValidateType,
    RequestDecorator,
    RequestPaginatedDecorator,
    RequestPaginatedValidateParamsDecorator,
    SuccessDto,
    PaginatedDto,
} from '@/shared/utils'
import { HorecaRequestsService } from '../services/horecaRequests.service'
import { HorecaRequestSetStatusDto } from '../dto/horecaRequest.approveProviderRequest.dto'
import { HorecaRequestWithProviderRequestsDto } from '../dto/horecaRequest.withProviderRequests.dto'
import { HorecaRequestSearchDto } from '../dto/horecaRequest.search.dto'
import { HorecaRequestWithActiveProviderRequestDto } from '../dto/horecaRequest.withActiveProviderRequest.dto'

@AuthUser(UserRole.Horeca)
@Controller('horeca/requests')
@ApiTags('HorecaRequests')
export class HorecaRequestsController {
    constructor(private readonly service: HorecaRequestsService) {}

    @Post()
    @ApiOperation({ summary: 'Создать заявку. Роль пользователя: Хорека' })
    @RequestDecorator(HorecaRequestDto, HorecaRequestCreateDto)
    async create(@AuthParamDecorator() auth: AuthInfoDto, @Body() dto: HorecaRequestCreateDto) {
        return this.service.create(auth, dto)
    }

    @Get(':id')
    @RequestDecorator(HorecaRequestWithProviderRequestsDto)
    @ApiOperation({
        summary: 'Получить заявку хореки включая все отклики от поставщиков для сравнения. Роль пользователя: Хорека',
    })
    async get(@AuthParamDecorator() auth: AuthInfoDto, @Param('id') id: number) {
        await this.service.validate(auth, +id)
        return this.service.getOneWithCounterProviderRequests(+id)
    }

    @Get()
    @RequestPaginatedDecorator(HorecaRequestWithActiveProviderRequestDto, HorecaRequestSearchDto)
    @ApiOperation({ summary: 'Получить все свои заявки. Роль пользователя: Хорека' })
    async findAll(
        @AuthParamDecorator() auth: AuthInfoDto,
        @RequestPaginatedValidateParamsDecorator<HorecaRequestSearchDto>({ search: HorecaRequestSearchDto })
        paginate: PaginateValidateType<HorecaRequestSearchDto>
    ) {
        const [data, total] = await this.service.findAllAndCount(auth, paginate)
        return new PaginatedDto<HorecaRequestWithActiveProviderRequestDto>(data, total)
    }

    @Post('approve')
    @RequestDecorator(SuccessDto, HorecaRequestSetStatusDto)
    @ApiOperation({ summary: 'Подтвердить одну из заявок поставщика. Роль пользователя: Хорека' })
    async approveProviderRequest(@AuthParamDecorator() auth: AuthInfoDto, @Body() dto: HorecaRequestSetStatusDto) {
        await this.service.validate(auth, dto.horecaRequestId)
        const res = await this.service.approveProviderRequest(dto, true)
        return new SuccessDto('ok')
    }

    @Post('cancelProviderRequest')
    @RequestDecorator(SuccessDto, HorecaRequestSetStatusDto)
    @ApiOperation({ summary: 'Отменить раннее выбранную заявку поставщика. Роль пользователя: Хорека' })
    async cancelProviderRequest(@AuthParamDecorator() auth: AuthInfoDto, @Body() dto: HorecaRequestSetStatusDto) {
        await this.service.validate(auth, dto.horecaRequestId)
        const res = await this.service.cancelProviderRequest(dto)
        return new SuccessDto('ok')
    }

    @Get(':id/cancel')
    @RequestDecorator(SuccessDto)
    @ApiOperation({ summary: 'Отменить свою заявку. Роль пользователя: Хорека' })
    async cancel(@AuthParamDecorator() auth: AuthInfoDto, @Param('id') id: number) {
        await this.service.validate(auth, +id)
        const res = await this.service.cancel(+id)
        return new SuccessDto('ok')
    }
}
