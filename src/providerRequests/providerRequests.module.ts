import { Module } from '@nestjs/common'
import { PrismaService } from '../prisma.service'
import { UsersModule } from '../users/users.module'
import { ProviderRequestsService } from './providerRequests.service'
import { ProviderRequestsController } from './providerRequests.controller'
import { UploadsModule } from '../uploads/uploads.module'

@Module({
    imports: [UsersModule, UploadsModule],
    controllers: [ProviderRequestsController],
    providers: [ProviderRequestsService, PrismaService],
})
export class ProviderRequestsModule {}
