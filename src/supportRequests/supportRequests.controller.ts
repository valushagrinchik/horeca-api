import { Controller, Post, Body, Param, Get } from '@nestjs/common'
import { SupportRequestsService } from './services/supportRequests.service'

import { ApiOperation, ApiTags } from '@nestjs/swagger'
import { AuthUser } from '../system/utils/auth/decorators/auth.decorator'
import { UserRole } from '@prisma/client'
import {
    PaginateValidateType,
    RequestDecorator,
    RequestPaginatedDecorator,
    RequestPaginatedValidateParamsDecorator,
} from '../system/utils/swagger/decorators'

import { AuthParamDecorator } from '../system/utils/auth/decorators/auth.param.decorator'
import { AuthInfoDto } from '../users/dto/auth.info.dto'
import { SuccessDto } from '../system/utils/dto/success.dto'
import { SupportRequestCreateDto } from './dto/supportRequest.create.dto'
import { SupportRequestDto } from './dto/supportRequest.dto'
import { PaginatedDto } from '../system/utils/dto/paginated.dto'
import { SupportRequestSearchDto } from './dto/supportRequest.search.dto'

@AuthUser(UserRole.Provider, UserRole.Horeca)
@Controller('support/requests')
@ApiTags('SupportRequest')
export class SupportRequestsController {
    constructor(private supportRequestService: SupportRequestsService) {}

    @Post()
    @RequestDecorator(SupportRequestDto, SupportRequestCreateDto)
    @ApiOperation({ summary: 'Creates request to support' })
    async create(@AuthParamDecorator() auth: AuthInfoDto, @Body() dto: SupportRequestCreateDto) {
        const response = await this.supportRequestService.create(auth, dto)
        return new SupportRequestDto(response)
    }

    @Post(':id/resolve')
    @RequestDecorator(SuccessDto)
    @ApiOperation({ summary: 'Marks request to support as resolved' })
    async resolve(@AuthParamDecorator() auth: AuthInfoDto, @Param('id') id: number) {
        await this.supportRequestService.resolve(auth, +id)
        return new SuccessDto('ok')
    }

    @Get('mine')
    @RequestPaginatedDecorator(SupportRequestDto, SupportRequestSearchDto)
    @ApiOperation({ summary: "List of users's support requests" })
    async list(
        @AuthParamDecorator() auth: AuthInfoDto,
        @RequestPaginatedValidateParamsDecorator() paginate: PaginateValidateType<SupportRequestSearchDto>
    ) {
        const [data, total] = await this.supportRequestService.findAllAndCount(auth, paginate, true)
        return new PaginatedDto<SupportRequestDto>(data, total)
    }
}
