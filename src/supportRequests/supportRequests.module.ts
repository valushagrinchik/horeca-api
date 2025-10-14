import { SupportRequestsController } from './supportRequests.controller'
import { SupportRequestsService } from './services/supportRequests.service'
import { forwardRef, Module } from '@nestjs/common'
import { UsersModule } from '../users/users.module'
import { SupportRequestsDbService } from './services/supportRequests.db.service'
import { SupportRequestsAdminController } from './supportRequests.admin.controller'

@Module({
    imports: [forwardRef(() => UsersModule)],
    controllers: [SupportRequestsController, SupportRequestsAdminController],
    providers: [SupportRequestsService, SupportRequestsDbService],
    exports: [SupportRequestsService],
})
export class SupportRequestsModule {}
