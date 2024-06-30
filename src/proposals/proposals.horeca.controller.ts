import { Body, Controller, Get, Param, Post } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { CreateProposalDto } from "./dto/create-proposal.dto";
import { ProposalsHorecaService } from "./proposals.horeca.service";
import { AuthUser } from "src/utils/auth/decorators/auth.decorator";
import { UserRole } from "@prisma/client";
import { DockGet, DockPost } from "src/utils/swagger/decorators/swagger.decorators";
import { ProposalDto } from "./dto/proposal.dto";
import { CreateProposalTemplateDto } from "./dto/create-proposal-template.dto";
import { ProposalTemplateDto } from "./dto/proposal-template.dto";

@AuthUser(UserRole.Horeca)
@Controller('proposals/horeca')
@ApiTags('Proposals')
export class ProposalsHorecaController {
    constructor(private readonly service: ProposalsHorecaService) {}

    @Post()
    @DockPost(CreateProposalDto, ProposalDto )
    async create(@Body() dto: CreateProposalDto) {
        return this.service.create(dto)
    }

    @Post('template')
    @DockPost(CreateProposalTemplateDto, ProposalTemplateDto )
    async createTemplate(@Body() dto: CreateProposalTemplateDto) {
        return this.service.createTemplate(dto)
    }

    @Get('template/:id')
    @DockGet(ProposalTemplateDto )
    async getTemplate(@Param('id') id: number) {
        return this.service.getTemplate(id)
    }
}