import { WebSocketGateway } from '@nestjs/websockets'

import { NotificationEvents } from '../system/utils/enums/websocketEvents.enum'

import { WsGateway } from '../system/ws.gateway'

const WS_PORT = Number(process.env.WS_PORT ?? 4000)

type ReviewNotificationPayload = {
    hRequestId: number
    pRequestId: number
    chatId: number
}

type ProviderRequestNotificationPayload = {
    hRequestId: number
    pRequestId: number
}
type NotificationPayload = ReviewNotificationPayload | ProviderRequestNotificationPayload | {}

@WebSocketGateway(WS_PORT, { namespace: 'notifications', cors: true, transports: ['websocket'] })
export class NotificationWsGateway extends WsGateway<NotificationEvents, NotificationPayload> {
    public sendNotification(userId: number, event: NotificationEvents, payload: NotificationPayload) {
        this.sendTo(userId, event, payload)
    }
}
