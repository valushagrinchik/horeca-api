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
import { forwardRef, Inject, OnModuleInit } from '@nestjs/common'
import { ChatMessageCreateDto } from '../chat/dto/chat.message.create.dto'
import { ChatMessageDto } from './dto/chat.message.dto'

const WS_PORT = Number(process.env.WS_PORT ?? 4000)

@WebSocketGateway(WS_PORT, { namespace: 'chats', cors: true, transports: ['websocket'] })
export class ChatWsGateway implements OnModuleInit, OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer() server: Server
    private clients: { userId: number; client: Socket }[] = []

    constructor(
        private jwtService: JwtService,
        private configService: ConfigService,
        @Inject(forwardRef(() => ChatService))
        private chatService: ChatService
    ) {}

    onModuleInit() {
        this.server.on('error', error => {
            console.log(error, 'error!!!')
        })
    }

    async handleConnection(client: Socket) {
        try {
            if (typeof client.handshake.headers.authorization === 'string') {
                const payload = this.jwtService.verify(client.handshake.headers.authorization.replace('Bearer ', ''), {
                    secret: this.configService.get('JWT_ACCESS_TOKEN_SECRET'),
                })

                console.log({ payload })

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
        @MessageBody() dto: ChatMessageCreateDto
    ): Promise<void> {
        const auth = (client as any).auth
        const chat = await this.chatService.createMessage(auth, dto)
    }

    public emitToOpponent(userId: number, event: WebsocketEvents, payload: ChatMessageDto) {
        const connected = this.clients.find(client => client.userId == userId)
        if (connected) {
            connected.client.emit(event, payload)
        }
    }

    public emitToOpponents(userIds: number[], event: WebsocketEvents, payload: ChatMessageDto) {
        this.clients
            .filter(client => userIds.includes(client.userId))
            .map(connected => {
                connected.client.emit(event, payload)
            })
    }
}
