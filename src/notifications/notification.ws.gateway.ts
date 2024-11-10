import { WebSocketGateway } from '@nestjs/websockets'

import { NotificationEvents } from '../system/utils/enums/websocketEvents.enum'

import { WsGateway } from '../system/ws.gateway'
import { HorecaRequestStatus } from '@prisma/client'

const WS_PORT = Number(process.env.WS_PORT ?? 4000)

type ReviewNotificationPayload = {
    hRequestId: number
    pRequestId: number
    chatId: number
}

type ProviderRequestCreatedNotificationPayload = {
    hRequestId: number
    pRequestId: number
}

type ProviderRequestStatusChangedNotificationPayload = {
    pRequestId: number
    status: HorecaRequestStatus
}

type ProviderAddedToFavouritesNotificationPayload = {
    horecaId: number
}

type ProviderDeletedFromFavouritesNotificationPayload = {
    horecaId: number
}

// type HorecaRequestStatusChangedNotificationPayload = {
//     hRequestId: number
//     status: HorecaRequestStatus
// }

type NotificationPayload =
    | ReviewNotificationPayload
    | ProviderRequestCreatedNotificationPayload
    | ProviderRequestStatusChangedNotificationPayload
    | ProviderAddedToFavouritesNotificationPayload
    | ProviderDeletedFromFavouritesNotificationPayload
    // | HorecaRequestStatusChangedNotificationPayload
    | {}

@WebSocketGateway(WS_PORT, { namespace: 'notifications', cors: true, transports: ['websocket'] })
export class NotificationWsGateway extends WsGateway<NotificationEvents, NotificationPayload> {
    public sendNotification(userId: number, event: NotificationEvents, payload: NotificationPayload) {
        this.sendTo(userId, event, payload)
    }
}
