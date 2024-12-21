import { Controller, Post, Param, Get, Body } from '@nestjs/common'
import { SupportRequestsService } from './services/supportRequests.service'
import { ApiOperation, ApiTags } from '@nestjs/swagger'
import { AuthUser } from '../system/utils/auth/decorators/auth.decorator'
import { UserRole } from '@prisma/client'
import { PaginateValidateType, RequestDecorator, RequestPaginatedDecorator, RequestPaginatedValidateParamsDecorator } from '../system/utils/swagger/decorators'
import { AuthParamDecorator } from '../system/utils/auth/decorators/auth.param.decorator'
import { AuthInfoDto } from '../users/dto/auth.info.dto'
import { SuccessDto } from '../system/utils/dto/success.dto'
import { SupportRequestDto } from './dto/supportRequest.dto'
import { PaginatedDto } from '../system/utils/dto/paginated.dto'
import { SupportRequestSearchDto } from './dto/supportRequest.search.dto'

@AuthUser(UserRole.Admin)
@Controller('support/requests')
@ApiTags('SupportRequest')
export class SupportRequestsAdminController {
    constructor(private supportRequestService: SupportRequestsService) {}

    @Post(':id/assign')
    @RequestDecorator(SuccessDto)
    @ApiOperation({ summary: 'Admin assigns himself to customer support request' })
    async assignAdmin(@AuthParamDecorator() auth: AuthInfoDto, @Param('id') id: number) {
        await this.supportRequestService.assignAdmin(auth, +id)
        return new SuccessDto('ok')
    }

    @Get()
    @RequestPaginatedDecorator(SupportRequestDto, SupportRequestSearchDto)
    @ApiOperation({ summary: 'Admin get list of all support requests' })
    async list(@AuthParamDecorator() auth: AuthInfoDto,  
    @RequestPaginatedValidateParamsDecorator() paginate: PaginateValidateType<SupportRequestSearchDto>) {
        const [data, total] = await this.supportRequestService.findAllAndCount(auth, paginate)
        return new PaginatedDto<SupportRequestDto>(data, total)
    }
}

