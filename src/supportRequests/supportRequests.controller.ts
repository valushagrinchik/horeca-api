import { Controller, Post, Body, Param } from '@nestjs/common'
import { SupportRequestsService } from './services/supportRequests.service'

import { ApiOperation, ApiTags } from '@nestjs/swagger'
import { AuthUser } from '../system/utils/auth/decorators/auth.decorator'
import { UserRole } from '@prisma/client'
import { RequestDecorator } from '../system/utils/swagger/decorators'

import { AuthParamDecorator } from '../system/utils/auth/decorators/auth.param.decorator'
import { AuthInfoDto } from '../users/dto/auth.info.dto'
import { SupportRequestCreateDto } from './dto/supportRequest.create.dto'
import { SupportRequestDto } from './dto/supportRequest.dto'
import { SuccessDto } from 'src/system/utils/dto/success.dto'

@AuthUser(UserRole.Provider, UserRole.Horeca)
@Controller('support/requests')
@ApiTags('SupportRequest')
export class SupportRequestsController {
    constructor(private supportRequestService: SupportRequestsService) {}

    @Post()
    @RequestDecorator(SupportRequestDto, SupportRequestCreateDto)
    @ApiOperation({ summary: 'Creates request to support' })
    async create(@AuthParamDecorator() auth: AuthInfoDto, @Body() dto: SupportRequestCreateDto) {
        const request = await this.supportRequestService.create(auth, dto)
        return new SupportRequestDto(request)
    }

    @Post(':id/resolve')
    @RequestDecorator(SuccessDto)
    @ApiOperation({ summary: 'Marks request to support as resolved' })
    async assign(@AuthParamDecorator() auth: AuthInfoDto, @Param('id') id: number) {
        return this.supportRequestService.resolve(auth, id)
    }
}
