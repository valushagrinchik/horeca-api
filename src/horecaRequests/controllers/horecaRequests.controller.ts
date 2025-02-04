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
    @ApiOperation({ summary: 'Create products(categories) set proposal needed for HoReCa' })
    @RequestDecorator(HorecaRequestDto, HorecaRequestCreateDto)
    async create(@AuthParamDecorator() auth: AuthInfoDto, @Body() dto: HorecaRequestCreateDto) {
        return this.service.create(auth, dto)
    }

    @Get(':id')
    @RequestDecorator(HorecaRequestWithProviderRequestDto)
    @ApiOperation({ summary: "Get Horeca request with Provider's requests to compare" })
    async get(@AuthParamDecorator() auth: AuthInfoDto, @Param('id') id: number) {
        await this.service.validate(auth, +id)
        return this.service.get(+id)
    }

    @Get()
    @RequestPaginatedDecorator(HorecaRequestDto, HorecaRequestSearchDto)
    @ApiOperation({ summary: 'All Horeca requests' })
    async findAll(
        @AuthParamDecorator() auth: AuthInfoDto,
        @RequestPaginatedValidateParamsDecorator() paginate: PaginateValidateType<HorecaRequestSearchDto>
    ) {
        const [data, total] = await this.service.findAllAndCount(auth, paginate)
        return new PaginatedDto<HorecaRequestDto>(data, total)
    }

    @Post('approve')
    @RequestDecorator(SuccessDto, HorecaRequestSetStatusDto)
    @ApiOperation({ summary: 'Approve one of providers request to be able to start chat with' })
    async approveProviderRequest(@AuthParamDecorator() auth: AuthInfoDto, @Body() dto: HorecaRequestSetStatusDto) {
        await this.service.validate(auth, dto.horecaRequestId)
        const res = await this.service.approveProviderRequest(dto, true)
        return new SuccessDto('ok')
    }

    @Post('cancelProviderRequest')
    @RequestDecorator(SuccessDto, HorecaRequestSetStatusDto)
    @ApiOperation({ summary: 'Cancel earlier chosen provider request' })
    async cancelProviderRequest(@AuthParamDecorator() auth: AuthInfoDto, @Body() dto: HorecaRequestSetStatusDto) {
        await this.service.validate(auth, dto.horecaRequestId)
        const res = await this.service.cancelProviderRequest(dto)
        return new SuccessDto('ok')
    }

    @Get(':id/cancel')
    @RequestDecorator(SuccessDto)
    @ApiOperation({ summary: 'Cancel horeca request' })
    async cancel(@AuthParamDecorator() auth: AuthInfoDto, @Param('id') id: number) {
        await this.service.validate(auth, +id)
        const res = await this.service.cancel(+id)
        return new SuccessDto('ok')
    }
}
