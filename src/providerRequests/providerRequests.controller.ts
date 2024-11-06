import { Body, Controller, Get, Param, Post, Put } from '@nestjs/common'
import { ApiOperation, ApiTags } from '@nestjs/swagger'
import { AuthUser } from '../system/utils/auth/decorators/auth.decorator'
import { UserRole } from '@prisma/client'
import { AuthInfoDto } from '../users/dto/auth.info.dto'
import { AuthParamDecorator } from '../system/utils/auth/decorators/auth.param.decorator'
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
import { HorecaRequestDto } from '../horecaRequests/dto/horecaRequest.dto'
import { HorecaRequestProviderStatusDto } from './dto/horecaRequest.providerStatus.dto'
import { HorecaRequestSearchDto } from './dto/horecaRequest.search.dto'
import { PaginatedDto } from '../system/utils/dto/paginated.dto'
import { ProviderRequestSearchDto } from './dto/providerRequest.search.dto'

@AuthUser(UserRole.Provider)
@Controller('provider/requests')
@ApiTags('ProviderRequests')
export class ProviderRequestsController {
    constructor(private readonly service: ProviderRequestsService) {}

    @Get('income')
    //  TODO: dto chould be changed
    @RequestPaginatedDecorator(HorecaRequestDto)
    @ApiOperation({ summary: "List of HoReCa proposals that matches with provider's offers" })
    async incomeHorecaRequests(
        @AuthParamDecorator() auth: AuthInfoDto,
        @RequestPaginatedValidateParamsDecorator() paginate: PaginateValidateType<HorecaRequestSearchDto>
    ) {
        const [data, total] = await this.service.findHorecaRequests(auth, paginate)
        return new PaginatedDto<HorecaRequestDto>(data, total)
    }

    @Post('income/status')
    @RequestDecorator(SuccessDto, HorecaRequestProviderStatusDto)
    @ApiOperation({ summary: 'Hide or view income request' })
    async setStatusForIncomeHorecaRequest(
        @AuthParamDecorator() auth: AuthInfoDto,
        @Body() dto: HorecaRequestProviderStatusDto
    ) {
        await this.service.setStatusForIncomeHorecaRequest(auth, dto)
        return new SuccessDto('ok')
    }

    @Post()
    @RequestDecorator(ProviderRequestDto, ProviderRequestCreateDto)
    @ApiOperation({ summary: "Create provider request on horeca's one" })
    async create(@AuthParamDecorator() auth: AuthInfoDto, @Body() dto: ProviderRequestCreateDto) {
        return this.service.create(auth, dto)
    }

    @Put('id')
    @RequestDecorator(ProviderRequestDto, ProviderRequestCreateDto)
    @ApiOperation({ summary: 'Cancel request' })
    async cancel(@AuthParamDecorator() auth: AuthInfoDto, @Param('id') id: number) {
        await this.service.validate(auth, +id)
        return this.service.cancel(+id)
    }

    @Get()
    @RequestPaginatedDecorator(ProviderRequestDto)
    @ApiOperation({ summary: 'Get all provider requests' })
    async findAll(
        @AuthParamDecorator() auth: AuthInfoDto,
        @RequestPaginatedValidateParamsDecorator() paginate: PaginateValidateType<ProviderRequestSearchDto>
    ) {
        const [data, total] = await this.service.findAllAndCount(auth, paginate)
        return new PaginatedDto<ProviderRequestDto>(data, total)
    }
}
