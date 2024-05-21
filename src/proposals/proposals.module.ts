import { Module } from '@nestjs/common'
import { PrismaService } from 'src/prisma.service'
import { ProposalsHorecaController } from './proposals.horeca.controller'
import { ProposalsProviderController } from './proposals.provider.controller'
import { ProposalsHorecaService } from './proposals.horeca.service'
import { ProposalsProviderService } from './proposals.provider.service'
import { UsersModule } from 'src/users/users.module'

@Module({
    imports: [UsersModule],
    controllers: [ProposalsHorecaController, ProposalsProviderController],
    providers: [ProposalsHorecaService, PrismaService, ProposalsProviderService],
})
export class ProposalsModule {}
