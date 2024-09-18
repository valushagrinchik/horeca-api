import { Module } from '@nestjs/common'
import { UsersModule } from '../users/users.module'
import { ProviderRequestsService } from './services/providerRequests.service'
import { ProviderRequestsController } from './providerRequests.controller'
import { UploadsModule } from '../uploads/uploads.module'
import { ProviderRequestsDbService } from './services/providerRequests.db.service'

@Module({
    imports: [UsersModule, UploadsModule],
    controllers: [ProviderRequestsController],
    providers: [ProviderRequestsDbService, ProviderRequestsService],
})
export class ProviderRequestsModule {}
