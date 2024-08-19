import { Controller, Post } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { AuthUser } from '../utils/auth/decorators/auth.decorator'
import { UserRole } from '@prisma/client'
import { ApplicationsProviderService } from './applications.provider.service'
import { CreateApplicationDto } from './dto/create-application.dto'
import { ApplicationDto } from './dto/application.dto'
import { AuthInfoDto } from '../users/dto/auth.info.dto'
import { AuthParamDecorator } from '../utils/auth/decorators/auth.param.decorator'
import { RequestDecorator } from 'src/utils/swagger/decorators'

@AuthUser(UserRole.Provider)
@Controller('proposals/provider')
@ApiTags('Applications')
export class ApplicationsProviderController {
    constructor(private readonly service: ApplicationsProviderService) {}

    @Post()
    @RequestDecorator(ApplicationDto, CreateApplicationDto)
    async create(@AuthParamDecorator() auth: AuthInfoDto, dto: CreateApplicationDto) {
        return this.service.create(auth, dto)
    }
}
