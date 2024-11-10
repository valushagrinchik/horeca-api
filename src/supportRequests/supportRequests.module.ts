import { Module } from '@nestjs/common'
import { SupportRequestsController } from './supportRequests.controller'
import { SupportRequestsService } from './services/supportRequests.service'
import { UsersModule } from '../users/users.module'
import { SupportRequestsDbService } from './services/supportRequests.db.service'
import { SupportRequestsAdminController } from './supportRequests.admin.controller'

@Module({
    imports: [UsersModule],
    controllers: [SupportRequestsController, SupportRequestsAdminController],
    providers: [SupportRequestsService, SupportRequestsDbService],
    exports: [SupportRequestsService],
})
export class SupportRequestsModule {}
