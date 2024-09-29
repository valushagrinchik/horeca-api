import { Module } from '@nestjs/common'
import { UsersModule } from '../users/users.module'
import { HorecaRequestsService } from './services/horecaRequests.service'
import { HorecaRequestsController } from './horecaRequests.controller'
import { UploadsModule } from '../uploads/uploads.module'
import { HorecaRequestsDbService } from './services/horecaRequests.db.service'
import { HorecaRequestsTemplateDbService } from './services/horecaRequests.template.db.service'
import { HorecaRequestsTemplateController } from './horecaRequests.template.controller'
import { HorecaRequestsTemplateService } from './services/horecaRequests.template.service'
import { ChatModule } from '../chat/chat.module'

@Module({
    imports: [UsersModule, UploadsModule, ChatModule],
    controllers: [HorecaRequestsController, HorecaRequestsTemplateController],
    providers: [
        HorecaRequestsTemplateDbService,
        HorecaRequestsDbService,
        HorecaRequestsService,
        HorecaRequestsTemplateService,
    ],
    exports: [HorecaRequestsService],
})
export class HorecaRequestsModule {}
