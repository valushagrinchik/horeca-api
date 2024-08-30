import { JwtService } from '@nestjs/jwt'
import {
    ConnectedSocket,
    MessageBody,
    OnGatewayConnection,
    OnGatewayDisconnect,
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer,
} from '@nestjs/websockets'
import { Server, Socket } from 'socket.io'

import { WebsocketEvents } from '../system/utils/enums/websocketEvents.enum'
import { ConfigService } from '@nestjs/config'
import { ChatService } from './services/chat.service'
import { forwardRef, Inject, ValidationPipe } from '@nestjs/common'
import { ChatMessageCreateDto } from 'src/chat/dto/chat.message.create.dto'

const WS_PORT = Number(process.env.WS_PORT ?? 4000)

@WebSocketGateway(WS_PORT, { namespace: 'chats', cors: true, transports: ['websocket', 'polling'] })
export class ChatWsGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer() server: Server
    private clients: { userId: number; client: Socket }[] = []

    constructor(
        private jwtService: JwtService,
        private configService: ConfigService,
        @Inject(forwardRef(() => ChatService))
        private chatService: ChatService
    ) {}

    async handleConnection(client: Socket) {
        try {
            if (typeof client.handshake.headers.authorization === 'string') {
                const payload = this.jwtService.verify(client.handshake.headers.authorization.replace('Bearer ', ''), {
                    secret: this.configService.get('JWT_ACCESS_TOKEN_SECRET'),
                })

                client = Object.assign(client, {
                    auth: payload,
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

    @SubscribeMessage(WebsocketEvents.MESSAGE)
    async handleSendMessage(
        @ConnectedSocket() client: Socket,
        @MessageBody(new ValidationPipe()) dto: ChatMessageCreateDto
    ): Promise<void> {
        await this.chatService.createMessage((client as any).auth, dto)
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
