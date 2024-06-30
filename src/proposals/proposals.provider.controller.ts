import { Controller, Get } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { AuthUser } from '../utils/auth/decorators/auth.decorator'
import { UserRole } from '@prisma/client'
import { ProposalsProviderService } from './proposals.provider.service'
import { DockGet } from '../utils/swagger/decorators/swagger.decorators'
import { AuthInfoDto } from '../users/dto/auth.info.dto'
import { AuthParamDecorator } from '../utils/auth/decorators/auth.param.decorator'
import { ProposalDto } from './dto/proposal.dto'

@AuthUser(UserRole.Provider)
@Controller('proposals/provider')
@ApiTags('Proposals')
export class ProposalsProviderController {
    constructor(private readonly service: ProposalsProviderService) {}

    @Get()
    @DockGet([ProposalDto])
    async findAppropriateProposals(@AuthParamDecorator() auth: AuthInfoDto) {
        return this.service.findAppropriateProposals(auth)
    }
}
