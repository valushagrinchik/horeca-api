import { Module } from '@nestjs/common'
import { UsersModule } from '../users/users.module'
import { HorecaRequestsService } from './services/horecaRequests.service'
import { HorecaRequestsController } from './horecaRequests.controller'
import { UploadsModule } from '../uploads/uploads.module'
import { HorecaRequestsDbService } from './services/horecaRequests.db.service'
import { HorecaRequestsTemplateDbService } from './services/horecaRequestsTemplate.db.service'

@Module({
    imports: [UsersModule, UploadsModule],
    controllers: [ HorecaRequestsController],
    providers: [HorecaRequestsTemplateDbService, HorecaRequestsDbService, HorecaRequestsService],
})
export class HorecaRequestsModule {}
