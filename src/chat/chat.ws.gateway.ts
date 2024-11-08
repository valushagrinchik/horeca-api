import { JwtService } from '@nestjs/jwt'
import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway } from '@nestjs/websockets'
import { Socket } from 'socket.io'

import { ChatEvents } from '../system/utils/enums/websocketEvents.enum'
import { ConfigService } from '@nestjs/config'
import { ChatService } from './services/chat.service'
import { forwardRef, Inject } from '@nestjs/common'
import { ChatIncomeMessageCreateDto } from './dto/chat.income.message.create.dto'
import { ChatMessageDto } from './dto/chat.message.dto'
import { WsGateway } from '../system/ws.gateway'
import e from 'express'

const WS_PORT = Number(process.env.WS_PORT ?? 4000)

@WebSocketGateway(WS_PORT, { namespace: 'chats', cors: true, transports: ['websocket'] })
export class ChatWsGateway extends WsGateway<ChatEvents, ChatMessageDto> {
    constructor(
        protected jwtService: JwtService,
        protected configService: ConfigService,
        @Inject(forwardRef(() => ChatService))
        protected chatService: ChatService
    ) {
        super(jwtService, configService)
    }

    @SubscribeMessage(ChatEvents.MESSAGE)
    async handleSendMessage(
        @ConnectedSocket() client: Socket,
        @MessageBody() dto: ChatIncomeMessageCreateDto
    ): Promise<void> {
        const auth = (client as any).auth
        const chat = await this.chatService.createIncomeMessage(auth, dto)
        const sendTo = chat.opponents.find(o => o != dto.authorId)
        this.sendTo(sendTo, ChatEvents.MESSAGE, chat.messages[0])
    }
}
