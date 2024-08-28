import { Controller, Post } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { AuthUser } from '../utils/auth/decorators/auth.decorator'
import { UserRole } from '@prisma/client'
import { AuthInfoDto } from '../users/dto/auth.info.dto'
import { AuthParamDecorator } from '../utils/auth/decorators/auth.param.decorator'
import { RequestDecorator } from '../utils/swagger/decorators'
import { ProviderRequestsService } from './providerRequests.service'
import { ProviderRequestCreateDto } from './dto/providerRequest.create.dto'
import { ProviderRequestDto } from './dto/providerRequest.dto'

@AuthUser(UserRole.Provider)
@Controller('requests/provider')
@ApiTags('ProviderRequests')
export class ProviderRequestsController {
    constructor(private readonly service: ProviderRequestsService) {}

    @Post()
    @RequestDecorator(ProviderRequestDto, ProviderRequestCreateDto)
    async create(@AuthParamDecorator() auth: AuthInfoDto, dto: ProviderRequestCreateDto) {
        return this.service.create(auth, dto)
    }
}
