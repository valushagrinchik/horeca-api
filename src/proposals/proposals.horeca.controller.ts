import { Body, Controller, Get, Param, Post } from '@nestjs/common'
import { ApiOperation, ApiTags } from '@nestjs/swagger'
import { CreateProposalDto } from './dto/create-proposal.dto'
import { ProposalsHorecaService } from './proposals.horeca.service'
import { AuthUser } from '../utils/auth/decorators/auth.decorator'
import { UserRole } from '@prisma/client'
import { ProposalDto } from './dto/proposal.dto'
import { CreateProposalTemplateDto } from './dto/create-proposal-template.dto'
import { ProposalTemplateDto } from './dto/proposal-template.dto'
import { AuthParamDecorator } from '../utils/auth/decorators/auth.param.decorator'
import { AuthInfoDto } from '../users/dto/auth.info.dto'
import { RequestDecorator } from 'src/utils/swagger/decorators'

@AuthUser(UserRole.Horeca)
@Controller('proposals/horeca')
@ApiTags('Proposals')
export class ProposalsHorecaController {
    constructor(private readonly service: ProposalsHorecaService) {}

    @Post()
    @ApiOperation({ summary: 'Create products(categories) set proposal required for HoReCa' })
    @RequestDecorator(ProposalDto, CreateProposalDto)
    async create(@AuthParamDecorator() auth: AuthInfoDto, @Body() dto: CreateProposalDto) {
        return this.service.create(auth, dto)
    }

    @Post('template')
    @ApiOperation({ summary: 'Create template of products(categories) set proposal required for HoReCa to use later' })
    @RequestDecorator(ProposalTemplateDto, CreateProposalTemplateDto)
    async createTemplate(@Body() dto: CreateProposalTemplateDto) {
        return this.service.createTemplate(dto)
    }

    @Get('template/:id')
    @ApiOperation({ summary: 'Get template of products(categories) set proposal required for HoReCa' })
    @RequestDecorator(ProposalTemplateDto)
    async getTemplate(@Param('id') id: number) {
        return this.service.getTemplate(id)
    }
}
