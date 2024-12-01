import { Module } from '@nestjs/common'
import { HorecaRequestsModule } from '../horecaRequests/horecaRequests.module'
import { ProviderRequestsModule } from '../providerRequests/providerRequests.module'
import { UsersModule } from '../users/users.module'
import { HorecaPrivateRequestsController } from './horecaPrivateRequests.controller'
import { HorecaPrivateRequestsService } from './horecaPrivateRequests.service'

@Module({
    imports: [UsersModule, HorecaRequestsModule, ProviderRequestsModule],
    controllers: [HorecaPrivateRequestsController],
    providers: [HorecaPrivateRequestsService],
})
export class HorecaPrivateRequestsModule {}
