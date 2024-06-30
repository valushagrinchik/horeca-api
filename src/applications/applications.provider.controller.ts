import { Controller, Post } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { AuthUser } from '../utils/auth/decorators/auth.decorator'
import { UserRole } from '@prisma/client'
import { ApplicationsProviderService } from './applications.provider.service'
import { CreateApplicationDto } from './dto/create-application.dto'
import { DockPost } from '../utils/swagger/decorators/swagger.decorators'
import { ApplicationDto } from './dto/application.dto'
import { AuthInfoDto } from '../users/dto/auth.info.dto'
import { AuthParamDecorator } from '../utils/auth/decorators/auth.param.decorator'

@AuthUser(UserRole.Provider)
@Controller('proposals/provider')
@ApiTags('Proposals')
export class ApplicationsProviderController {
    constructor(private readonly service: ApplicationsProviderService) {}

    @Post()
    @DockPost(CreateApplicationDto, ApplicationDto)
    async findAppropriateProposals(@AuthParamDecorator() auth: AuthInfoDto, dto: CreateApplicationDto) {
        return this.service.create(auth, dto)
    }
}
