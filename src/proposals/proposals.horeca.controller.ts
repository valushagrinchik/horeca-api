import { Body, Controller, Post } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { CreateProposalHorecaDto } from "./dto/create-proposal.horeca.dto";
import { ProposalsHorecaService } from "./proposals.horeca.service";
import { AuthUser } from "src/utils/auth/decorators/auth.decorators";
import { UserRole } from "@prisma/client";

@AuthUser(UserRole.Horeca)
@Controller('proposals/horeca')
@ApiTags('Proposals')
export class ProposalsHorecaController {
    constructor(private readonly service: ProposalsHorecaService) {}

    @Post()
    async create(@Body() dto: CreateProposalHorecaDto) {
        // return this.service.create(dto)
        return { status: 'ok' }
    }
}