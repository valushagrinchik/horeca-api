import { WebSocketGateway } from '@nestjs/websockets'
import { NotificationEvents } from '@/shared/utils'
import { WsGateway } from '../system/ws.gateway'
import { NotificationPayload } from './dto/notification.payload.dto'
import { JwtService } from '@nestjs/jwt'
import { ConfigService } from '@nestjs/config'
import { Logger } from '@nestjs/common'

const WS_PORT = Number(process.env.WS_PORT ?? 4000)

@WebSocketGateway(WS_PORT, { namespace: 'notifications', cors: true, transports: ['websocket'] })
export class NotificationWsGateway extends WsGateway<NotificationEvents, NotificationPayload> {
    constructor(
        protected jwtService: JwtService,
        protected configService: ConfigService,
    ) {
        super(jwtService, configService)
    }
    public sendNotification(userId: number, event: NotificationEvents, payload: NotificationPayload) {
        this.logger.log(`Send notification  ${event} to ${userId}`)
        this.sendTo(userId, event, payload)
    }
}
