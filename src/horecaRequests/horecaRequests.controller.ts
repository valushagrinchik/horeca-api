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

    @Get(':id')
    @RequestDecorator(HorecaRequestDto)
    @ApiOperation({ summary: 'Get Horeca request' })
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
}
