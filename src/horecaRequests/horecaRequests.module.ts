import { Module } from '@nestjs/common'
import { UsersModule } from '../users/users.module'
import { HorecaRequestsService } from './HorecaRequests.service'
import { HorecaRequestsController } from './horecaRequests.controller'
import { UploadsModule } from '../uploads/uploads.module'

@Module({
    imports: [UsersModule, UploadsModule],
    controllers: [HorecaRequestsController],
    providers: [HorecaRequestsService],
})
export class HorecaRequestsModule {}
