import { Module } from '@nestjs/common'
import { UsersModule } from '../users/users.module'
import { ProviderRequestsService } from './services/providerRequests.service'
import { ProviderRequestsController } from './providerRequests.controller'
import { UploadsModule } from '../uploads/uploads.module'
import { ProviderRequestsDbService } from './services/providerRequests.db.service'
import { HorecaRequestsModule } from '../horecaRequests/horecaRequests.module'
import { HorecaRequestProviderStatusDbService } from './services/horecaRequest.providerStatus.db.service'

@Module({
    imports: [UsersModule, UploadsModule, HorecaRequestsModule],
    controllers: [ProviderRequestsController],
    providers: [HorecaRequestProviderStatusDbService, ProviderRequestsDbService, ProviderRequestsService],
})
export class ProviderRequestsModule {}
