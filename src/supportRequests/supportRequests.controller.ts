import { Controller, Post, Body, Param } from '@nestjs/common'
import { SupportRequestsService } from './services/supportRequests.service'

import { ApiOperation, ApiTags } from '@nestjs/swagger'
import { AuthUser } from '../system/utils/auth/decorators/auth.decorator'
import { UserRole } from '@prisma/client'
import { RequestDecorator } from '../system/utils/swagger/decorators'

import { AuthParamDecorator } from '../system/utils/auth/decorators/auth.param.decorator'
import { AuthInfoDto } from '../users/dto/auth.info.dto'
import { SupportRequestCreateDto } from './dto/supportRequest.create.dto'
import { SuccessDto } from '../system/utils/dto/success.dto'
import { SupportRequestCreateResponseDto } from './dto/supportRequest.create.response.dto'

@AuthUser(UserRole.Provider, UserRole.Horeca)
@Controller('support/requests')
@ApiTags('SupportRequest')
export class SupportRequestsController {
    constructor(private supportRequestService: SupportRequestsService) {}

    @Post()
    @RequestDecorator(SupportRequestCreateResponseDto, SupportRequestCreateDto)
    @ApiOperation({ summary: 'Creates request to support' })
    async create(@AuthParamDecorator() auth: AuthInfoDto, @Body() dto: SupportRequestCreateDto) {
        const response = await this.supportRequestService.create(auth, dto)
        return new SupportRequestCreateResponseDto(response)
    }

    @Post(':id/resolve')
    @RequestDecorator(SuccessDto)
    @ApiOperation({ summary: 'Marks request to support as resolved' })
    async resolve(@AuthParamDecorator() auth: AuthInfoDto, @Param('id') id: number) {
        return this.supportRequestService.resolve(auth, +id)
    }
}
