import { Module } from '@nestjs/common'
import { PrismaService } from '../prisma.service'
import { ApplicationsProviderController } from './applications.provider.controller'
import { ApplicationsProviderService } from './applications.provider.service'
import { UsersModule } from 'src/users/users.module'

@Module({
    imports: [UsersModule],
    controllers: [ApplicationsProviderController],
    providers: [ApplicationsProviderService, PrismaService],
})
export class ApplicationsModule {}
