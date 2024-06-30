import { Injectable } from '@nestjs/common'
import { CreateProposalDto } from './dto/create-proposal.dto'
import { PrismaService } from 'src/prisma.service'
import { ProposalDto } from './dto/proposal.dto'
import { CreateProposalTemplateDto } from './dto/create-proposal-template.dto'
import { ProposalTemplateDto } from './dto/proposal-template.dto'

@Injectable()
export class ProposalsHorecaService {
    constructor(private prisma: PrismaService) {}

    async create({ imageIds, ...dto }: CreateProposalDto) {
        const proposal = await this.prisma.proposal.create({
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

        return new ProposalDto(proposal)
    }

    async createTemplate({ content, ...dto }: CreateProposalTemplateDto) {
        const proposalTemplate = await this.prisma.proposalTemplate.create({
            data: {
                ...dto,
                content: JSON.stringify(content),
            },
        })
        return new ProposalTemplateDto(proposalTemplate)
    }

    async getTemplate(id: number) {
        const proposalTemplate = await this.prisma.proposalTemplate.findUnique({
            where: { id },
        })
        return new ProposalTemplateDto(proposalTemplate)
    }
}
