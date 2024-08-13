import { Controller, Get } from '@nestjs/common'
import { ApiOperation, ApiTags } from '@nestjs/swagger'
import { AuthUser } from '../utils/auth/decorators/auth.decorator'
import { UserRole } from '@prisma/client'
import { ProposalsProviderService } from './proposals.provider.service'
import { AuthInfoDto } from '../users/dto/auth.info.dto'
import { AuthParamDecorator } from '../utils/auth/decorators/auth.param.decorator'
import { ProposalDto } from './dto/proposal.dto'
import {
    PaginateValidateType,
    RequestPaginatedDecorator,
    RequestPaginatedValidateParamsDecorator,
} from 'src/utils/swagger/decorators'

@AuthUser(UserRole.Provider)
@Controller('proposals/provider')
@ApiTags('Proposals')
export class ProposalsProviderController {
    constructor(private readonly service: ProposalsProviderService) {}

    @Get()
    @RequestPaginatedDecorator(ProposalDto)
    @ApiOperation({ summary: "List of HoReCa proposals that matches with provider's offers" })
    async findAppropriateProposals(
        @AuthParamDecorator() auth: AuthInfoDto,
        @RequestPaginatedValidateParamsDecorator() paginate: PaginateValidateType
    ) {
        return this.service.findAppropriateProposals(auth, paginate)
    }
}
