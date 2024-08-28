// eslint-disable-next-line @typescript-eslint/no-var-requires
// require('dotenv').config()
import { JwtService } from '@nestjs/jwt'
import { OnGatewayConnection, OnGatewayDisconnect, WebSocketGateway, WebSocketServer } from '@nestjs/websockets'
import { Server, Socket } from 'socket.io'

import { WebsocketEvents } from './enums/websocket.events'
import { ConfigService } from '@nestjs/config'

const WS_PORT = Number(process.env.WS_PORT ?? 4000)

@WebSocketGateway(WS_PORT, { namespace: 'chats', cors: true, transports: ['websocket', 'polling'] })
export class WebsocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer() server: Server
    private clients: { userId: number; client: Socket }[] = []

    constructor(
        private jwtService: JwtService,
        private configService: ConfigService
    ) {}

    async handleConnection(client: Socket) {
        try {
            if (typeof client.handshake.query.token === 'string') {
                const payload = this.jwtService.verify(client.handshake.query.token, {
                    secret: this.configService.get('JWT_ACCESS_TOKEN_SECRET'),
                })
                this.clients.push({ userId: payload.id, client })
            } else {
                client.disconnect()
            }
        } catch (error) {
            client.disconnect()
        }
    }

    handleDisconnect(client: Socket) {
        this.clients = this.clients.filter(data => data.client !== client)
    }

    public emitToUsers<T>(userIds: number[], event: WebsocketEvents, payload: T) {
        if (!userIds) return
        userIds.forEach(userId => {
            this.emitToUser(userId, event, payload)
        })
    }

    public emitToUser<T>(userId: number, event: WebsocketEvents, payload: T) {
        this.clients.forEach(data => {
            if (data.userId === userId) {
                data.client.emit(event, payload)
            }
        })
    }
}
