import { Controller, Post, Body, Param } from '@nestjs/common'
import { SupportRequestsService } from './services/supportRequests.service'
import { ApiOperation, ApiTags } from '@nestjs/swagger'
import { AuthUser } from '../system/utils/auth/decorators/auth.decorator'
import { UserRole } from '@prisma/client'
import { RequestDecorator } from '../system/utils/swagger/decorators'
import { AuthParamDecorator } from '../system/utils/auth/decorators/auth.param.decorator'
import { AuthInfoDto } from '../users/dto/auth.info.dto'
import { SuccessDto } from '../system/utils/dto/success.dto'

@AuthUser(UserRole.Admin)
@Controller('support/requests')
@ApiTags('SupportRequest')
export class SupportRequestsAdminController {
    constructor(private supportRequestService: SupportRequestsService) {}

    @Post(':id/assign')
    @RequestDecorator(SuccessDto)
    @ApiOperation({ summary: 'Admin assigns himself to customer support request' })
    async assignAdmin(@AuthParamDecorator() auth: AuthInfoDto, @Param('id') id: number) {
        return this.supportRequestService.assignAdmin(auth, +id)
    }
}
