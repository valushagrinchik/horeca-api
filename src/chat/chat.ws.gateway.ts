import { JwtService } from '@nestjs/jwt'
import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway } from '@nestjs/websockets'
import { Socket } from 'socket.io'

import { ChatEvents } from '../system/utils/enums/websocketEvents.enum'
import { ConfigService } from '@nestjs/config'
import { ChatService } from './services/chat.service'
import { forwardRef, Inject } from '@nestjs/common'
import { WsMessageCreateDto } from './dto/ws.message.create.dto'
import { ChatMessageDto } from './dto/chat.message.dto'
import { WsGateway } from '../system/ws.gateway'
import e from 'express'
import { ChatServerMessageCreateDto } from './dto/chat.server.message.create.dto'
import { ApiExtraModels } from '@nestjs/swagger'

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
    async handleSendMessage(@ConnectedSocket() client: Socket, @MessageBody() dto: WsMessageCreateDto): Promise<void> {
        const auth = (client as any).auth
        await this.chatService.validate(auth, dto.chatId)
        const chat = await this.chatService.getChat(dto.chatId)
        const message = await this.chatService.createIncomeMessage(dto)
        const sendTo = chat.opponents.find(o => o != dto.authorId)
        this.sendTo(sendTo, ChatEvents.MESSAGE, message)
    }

    async sendServerMessage(dto: ChatServerMessageCreateDto): Promise<void> {
        const chat = await this.chatService.getChat(dto.chatId)
        const message = await this.chatService.createServerMessage(dto)
        chat.opponents.map(opponent => {
            this.sendTo(opponent, ChatEvents.MESSAGE, message)
        })
    }
}
