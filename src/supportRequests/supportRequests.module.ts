import { Module } from '@nestjs/common'
import { SupportRequestsController } from './supportRequests.controller'
import { SupportRequestsService } from './services/supportRequests.service'
import { UsersModule } from '../users/users.module'
import { ChatModule } from '../chat/chat.module'
import { SupportRequestsDbService } from './services/supportRequests.db.service'
import { SupportRequestsAdminController } from './supportRequests.admin.controller'

@Module({
    imports: [UsersModule, ChatModule],
    controllers: [SupportRequestsController, SupportRequestsAdminController],
    providers: [SupportRequestsService, SupportRequestsDbService],
    exports: [SupportRequestsService],
})
export class SupportRequestsModule {}
