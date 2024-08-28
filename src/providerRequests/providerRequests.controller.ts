import { Controller, Param, Post } from '@nestjs/common'
import { ApiOperation, ApiTags } from '@nestjs/swagger'
import { AuthUser } from '../system/auth/decorators/auth.decorator'
import { UserRole } from '@prisma/client'
import { AuthInfoDto } from '../users/dto/auth.info.dto'
import { AuthParamDecorator } from '../system/auth/decorators/auth.param.decorator'
import { RequestDecorator } from '../system/swagger/decorators'
import { ProviderRequestsService } from './providerRequests.service'
import { ProviderRequestCreateDto } from './dto/providerRequest.create.dto'
import { ProviderRequestDto } from './dto/providerRequest.dto'
import { SuccessDto } from '../system/dto/success.dto'

@AuthUser(UserRole.Provider)
@Controller('requests/provider')
@ApiTags('ProviderRequests')
export class ProviderRequestsController {
    constructor(private readonly service: ProviderRequestsService) {}

    @Post()
    @RequestDecorator(ProviderRequestDto, ProviderRequestCreateDto)
    @ApiOperation({ summary: 'Create provider request on horeca\'s one' })
    async create(@AuthParamDecorator() auth: AuthInfoDto, dto: ProviderRequestCreateDto) {
        return this.service.create(auth, dto)
    }

    @AuthUser(UserRole.Horeca)
    @Post(':id')
    @RequestDecorator(SuccessDto)
    @ApiOperation({ summary: 'Approve by HoReCa to be able to start chat with' })
    async approveByHoreca(@AuthParamDecorator() auth: AuthInfoDto, @Param('id') id: number) {
        await this.service.approveByHoreca(auth, id)
        return new SuccessDto('ok')
    }
}
