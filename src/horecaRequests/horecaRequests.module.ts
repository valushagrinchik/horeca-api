import { Module } from '@nestjs/common'
import { PrismaService } from '../prisma.service'
import { UsersModule } from '../users/users.module'
import { HorecaRequestsService } from './HorecaRequests.service'
import { HorecaRequestsController } from './horecaRequests.controller'
import { UploadsModule } from '../uploads/uploads.module'

@Module({
    imports: [UsersModule, UploadsModule],
    controllers: [HorecaRequestsController],
    providers: [HorecaRequestsService, PrismaService],
})
export class HorecaRequestsModule {}
