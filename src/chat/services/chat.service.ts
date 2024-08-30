import { AuthInfoDto } from '../../users/dto/auth.info.dto'
import { PaginateValidateType } from '../../system/utils/swagger/decorators'
import { ChatCreateDto } from '../dto/chat.create.dto'
import { ChatType } from '@prisma/client'
import { WebsocketEvents } from '../../system/utils/enums/websocketEvents.enum'
import { ChatMessageCreateDto } from '../dto/chat.message.create.dto'
import { ChatDto } from '../dto/chat.dto'
import { ChatMessageDto } from '../dto/chat.message.dto'
import { ChatWsGateway } from '../chat.ws.gateway'
import { forwardRef, Inject } from '@nestjs/common'
import { ChatDBService } from './chat.db.service'

export class ChatService {
    constructor(
        private chatRep: ChatDBService,
        @Inject(forwardRef(() => ChatWsGateway))
        private websocketGateway: ChatWsGateway
    ) {}

    async createChat(auth: AuthInfoDto, dto: ChatCreateDto) {
        const chat = await this.chatRep.createChat({
            ...dto,
            opponents: [auth.id, dto.opponentId],
            type: ChatType.Order,
        })

        await this.createMessage(
            auth,
            {
                chatId: chat.id,
                message: 'Chat is created',
                isServer: true,
            },
            WebsocketEvents.CHAT
        )
        return new ChatDto(chat)
    }

    async getChat(auth: AuthInfoDto, id: number) {
        const chat = await this.chatRep.getChat(id)
        return new ChatDto({ ...chat, messages: chat.messages.map(m => new ChatMessageDto(m)) })
    }

    async createMessage(
        auth: AuthInfoDto,
        { chatId, ...dto }: ChatMessageCreateDto,
        event: WebsocketEvents = WebsocketEvents.MESSAGE
    ) {
        const chat = await this.chatRep.getChat(chatId, undefined)
        const message = await this.chatRep.createMessage({ ...dto, chatId })

        this.websocketGateway.emitToUsers(chat.opponents, event, message)

        return message
    }

    async getChats(auth: AuthInfoDto, paginate: PaginateValidateType) {
        return this.chatRep.getChats(auth.id, paginate)
    }
}
