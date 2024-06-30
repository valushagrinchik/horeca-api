import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma.service'
import { AuthInfoDto } from '../users/dto/auth.info.dto'
import { ProposalDto } from './dto/proposal.dto'

@Injectable()
export class ProposalsProviderService {
    constructor(private prisma: PrismaService) {}

    async findAppropriateProposals(auth: AuthInfoDto) {
        const now = new Date()
        const provider = await this.prisma.user.findUnique({ where: { id: auth.id }, include: { profile: true } })
        const categories = provider.profile.categories
        const proposals = await this.prisma.proposal.findMany({
            where: {
                items: {
                    some: {
                        category: { in: categories },
                    },
                },
                //TODO: check only day not time
                acceptUntill: {
                    gte: now,
                },
            },
        })
        return proposals.map(proposal => new ProposalDto(proposal))
    }
}
