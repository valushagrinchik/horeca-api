import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { NotificationWsGateway } from './notification.ws.gateway'
import { UsersModule } from '../users/users.module'
import { NotificationController } from './notification.controller'

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
        }),
        UsersModule,
    ],
    controllers: [NotificationController],
    providers: [NotificationWsGateway],
    exports: [NotificationWsGateway],
})
export class NotificationModule {}
