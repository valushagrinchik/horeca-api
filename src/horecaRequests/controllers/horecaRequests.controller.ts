import { Body, Controller, Get, Param, Post } from '@nestjs/common'
import { ApiOperation, ApiTags } from '@nestjs/swagger'
import { HorecaRequestCreateDto } from '../dto/horecaRequest.create.dto'
import { AuthUser } from '../../system/utils/auth/decorators/auth.decorator'
import { UserRole } from '@prisma/client'
import { HorecaRequestDto } from '../dto/horecaRequest.dto'
import { AuthParamDecorator } from '../../system/utils/auth/decorators/auth.param.decorator'
import { AuthInfoDto } from '../../users/dto/auth.info.dto'
import {
    PaginateValidateType,
    RequestDecorator,
    RequestPaginatedDecorator,
    RequestPaginatedValidateParamsDecorator,
} from '../../system/utils/swagger/decorators'
import { HorecaRequestsService } from '../services/horecaRequests.service'
import { SuccessDto } from '../../system/utils/dto/success.dto'
import { HorecaRequestSetStatusDto } from '../dto/horecaRequest.approveProviderRequest.dto'
import { HorecaRequestWithProviderRequestDto } from '../dto/horecaRequest.withProviderRequests.dto'
import { PaginatedDto } from '../../system/utils/dto/paginated.dto'
import { HorecaRequestSearchDto } from '../dto/horecaRequest.search.dto'

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
    @RequestDecorator(HorecaRequestWithProviderRequestDto)
    @ApiOperation({
        summary: 'Получить заявку хореки включая все отклики от поставщиков для сравнения. Роль пользователя: Хорека',
    })
    async get(@AuthParamDecorator() auth: AuthInfoDto, @Param('id') id: number) {
        await this.service.validate(auth, +id)
        return this.service.get(+id)
    }

    @Get()
    @RequestPaginatedDecorator(HorecaRequestDto, HorecaRequestSearchDto)
    @ApiOperation({ summary: 'Получить все свои заявки. Роль пользователя: Хорека' })
    async findAll(
        @AuthParamDecorator() auth: AuthInfoDto,
        @RequestPaginatedValidateParamsDecorator() paginate: PaginateValidateType<HorecaRequestSearchDto>
    ) {
        const [data, total] = await this.service.findAllAndCount(auth, paginate)
        return new PaginatedDto<HorecaRequestDto>(data, total)
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
