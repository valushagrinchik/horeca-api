import { Module } from '@nestjs/common'
import { UsersModule } from '../users/users.module'
import { HorecaRequestsService } from './services/horecaRequests.service'
import { HorecaRequestsController } from './controllers/horecaRequests.controller'
import { UploadsModule } from '../uploads/uploads.module'
import { HorecaRequestsDbService } from './services/horecaRequests.db.service'
import { HorecaRequestsTemplateDbService } from './services/horecaRequests.template.db.service'
import { HorecaRequestsTemplateController } from './controllers/horecaRequests.template.controller'
import { HorecaRequestsTemplateService } from './services/horecaRequests.template.service'
import { CronModule } from '../system/cron/cron.module'
import { HorecaRequestsCronService } from './services/horecaRequests.cron.service'
@Module({
    imports: [UsersModule, UploadsModule, CronModule],
    controllers: [HorecaRequestsTemplateController, HorecaRequestsController],
    providers: [
        HorecaRequestsTemplateDbService,
        HorecaRequestsDbService,
        HorecaRequestsService,
        HorecaRequestsTemplateService,
        HorecaRequestsCronService,
    ],
    exports: [HorecaRequestsService],
})
export class HorecaRequestsModule {}
