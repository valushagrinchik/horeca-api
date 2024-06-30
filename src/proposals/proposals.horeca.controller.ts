import { Body, Controller, Get, Param, Post } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { CreateProposalHorecaDto } from "./dto/create-proposal.horeca.dto";
import { ProposalsHorecaService } from "./proposals.horeca.service";
import { AuthUser } from "src/utils/auth/decorators/auth.decorator";
import { UserRole } from "@prisma/client";
import { DockGet, DockPost } from "src/utils/swagger/decorators/swagger.decorators";
import { ProposalHorecaDto } from "./dto/proposal.horeca.dto";
import { CreateProposalTemplateHorecaDto } from "./dto/create-proposal-template.horeca.dto";
import { ProposalTemplateHorecaDto } from "./dto/proposal-template.horeca.dto";

@AuthUser(UserRole.Horeca)
@Controller('proposals/horeca')
@ApiTags('Proposals')
export class ProposalsHorecaController {
    constructor(private readonly service: ProposalsHorecaService) {}

    @Post()
    @DockPost(CreateProposalHorecaDto, ProposalHorecaDto )
    async create(@Body() dto: CreateProposalHorecaDto) {
        return this.service.create(dto)
    }

    @Post('template')
    @DockPost(CreateProposalTemplateHorecaDto, ProposalTemplateHorecaDto )
    async createTemplate(@Body() dto: CreateProposalTemplateHorecaDto) {
        return this.service.createTemplate(dto)
    }

    @Get('template/:id')
    @DockGet(ProposalTemplateHorecaDto )
    async getTemplate(@Param('id') id: number) {
        return this.service.getTemplate(id)
    }
}