import { Body, Controller, Post } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { AuthUser } from "src/utils/auth/decorators/auth.decorators";
import { UserRole } from "@prisma/client";
import { CreateProposalProviderDto } from "./dto/create-proposal.provider.dto";
import { ProposalsProviderService } from "./proposals.provider.service";

@AuthUser(UserRole.Provider)
@Controller('proposals/provider')
@ApiTags('Proposals')
export class ProposalsProviderController {
    constructor(private readonly service: ProposalsProviderService) {}

    @Post()
    async registrate(@Body() dto: CreateProposalProviderDto) {
        return this.service.create(dto)
    }
}