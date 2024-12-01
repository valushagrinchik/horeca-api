import { Module } from '@nestjs/common'
import { UsersModule } from '../users/users.module'
import { ProviderRequestsService } from './services/providerRequests.service'
import { ProviderRequestsController } from './providerRequests.controller'
import { UploadsModule } from '../uploads/uploads.module'
import { ProviderRequestsDbService } from './services/providerRequests.db.service'
import { HorecaRequestsModule } from '../horecaRequests/horecaRequests.module'
import { HorecaRequestProviderStatusDbService } from './services/horecaRequest.providerStatus.db.service'
import { NotificationModule } from '../notifications/notification.module'
import { ChatModule } from '../chat/chat.module'

@Module({
    imports: [UsersModule, UploadsModule, HorecaRequestsModule, NotificationModule, ChatModule],
    controllers: [ProviderRequestsController],
    providers: [HorecaRequestProviderStatusDbService, ProviderRequestsDbService, ProviderRequestsService],
    exports: [ProviderRequestsService],
})
export class ProviderRequestsModule {}
