import { Injectable } from '@nestjs/common'
import { CreateProposalHorecaDto } from './dto/create-proposal.horeca.dto'
import { PrismaService } from 'src/prisma.service'
import { ProposalHorecaDto } from './dto/proposal.horeca.dto'
import { CreateProposalTemplateHorecaDto } from './dto/create-proposal-template.horeca.dto'
import { ProposalTemplateHorecaDto } from './dto/proposal-template.horeca.dto'

@Injectable()
export class ProposalsHorecaService {
    constructor(private prisma: PrismaService) {}

    async create({ imageIds, ...dto }: CreateProposalHorecaDto) {
        const proposal = await this.prisma.horecaApplication.create({
            data: {
                ...dto,
                ...(imageIds
                    ? {
                          images: {
                              createMany: {
                                  data: imageIds.map(imageId => ({ imageId })),
                              },
                          },
                      }
                    : {}),
                items: {
                    create: dto.items,
                },
            },
            include: {
                items: true,
                images: true,
            },
        })

        return new ProposalHorecaDto(proposal)
    }

    async createTemplate({ content, ...dto }: CreateProposalTemplateHorecaDto) {
        const proposalTemplate = await this.prisma.horecaApplicationTemplate.create({
            data: {
                ...dto,
                content: JSON.stringify(content),
            },
        })
        return new ProposalTemplateHorecaDto(proposalTemplate)
    }

    async getTemplate(id: number) {
        const proposalTemplate = await this.prisma.horecaApplicationTemplate.findUnique({
            where: { id },
        })
        return new ProposalTemplateHorecaDto(proposalTemplate)
    }
}
