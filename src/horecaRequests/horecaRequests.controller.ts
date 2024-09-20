import { Body, Controller, Get, Param, Post } from '@nestjs/common'
import { ApiOperation, ApiTags } from '@nestjs/swagger'
import { HorecaRequestCreateDto } from './dto/horecaRequest.create.dto'
import { AuthUser } from '../system/utils/auth/decorators/auth.decorator'
import { UserRole } from '@prisma/client'
import { HorecaRequestDto } from './dto/horecaRequest.dto'
import { AuthParamDecorator } from '../system/utils/auth/decorators/auth.param.decorator'
import { AuthInfoDto } from '../users/dto/auth.info.dto'
import {
    PaginateValidateType,
    RequestDecorator,
    RequestPaginatedDecorator,
    RequestPaginatedValidateParamsDecorator,
} from '../system/utils/swagger/decorators'
import { HorecaRequestsService } from './services/horecaRequests.service'
import { SuccessDto } from '../system/utils/dto/success.dto'
import { HorecaRequestApproveProviderRequestDto } from './dto/horecaRequest.approveProviderRequest.dto'
import { HorecaRequestWithProviderRequestDto } from './dto/horecaRequest.withProviderRequests.dto'

@AuthUser(UserRole.Horeca)
@Controller('horeca/requests')
@ApiTags('HorecaRequests')
export class HorecaRequestsController {
    constructor(private readonly service: HorecaRequestsService) {}

    @Post()
    @ApiOperation({ summary: 'Create products(categories) set proposal required for HoReCa' })
    @RequestDecorator(HorecaRequestDto, HorecaRequestCreateDto)
    async create(@AuthParamDecorator() auth: AuthInfoDto, @Body() dto: HorecaRequestCreateDto) {
        return this.service.create(auth, dto)
    }

    @Get(':id')
    @RequestDecorator(HorecaRequestWithProviderRequestDto)
    @ApiOperation({ summary: "Get Horeca request with Provider's requests to compare" })
    async get(@AuthParamDecorator() auth: AuthInfoDto, @Param('id') id: number) {
        return this.service.get(auth, +id)
    }

    @Get()
    @RequestPaginatedDecorator(HorecaRequestDto)
    @ApiOperation({ summary: 'All Horeca requests' })
    async findAll(
        @AuthParamDecorator() auth: AuthInfoDto,
        @RequestPaginatedValidateParamsDecorator() paginate: PaginateValidateType
    ) {
        return this.service.findAll(auth, paginate)
    }

    @Post('approve')
    @RequestDecorator(SuccessDto, HorecaRequestApproveProviderRequestDto)
    @ApiOperation({ summary: 'Approve one of providers request to be able to start chat with' })
    async approveProviderRequest(
        @AuthParamDecorator() auth: AuthInfoDto,
        @Body() dto: HorecaRequestApproveProviderRequestDto
    ) {
        const res = await this.service.approveProviderRequest(auth, dto)
        return new SuccessDto('ok')
    }
}
