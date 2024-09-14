import { AuthInfoDto } from '../../users/dto/auth.info.dto'
import { PaginateValidateType } from '../../system/utils/swagger/decorators'
import { ChatCreateDto } from '../dto/chat.create.dto'
import { ChatType } from '@prisma/client'
import { ChatMessageCreateDto } from '../dto/chat.message.create.dto'
import { ChatDto } from '../dto/chat.dto'
import { ChatMessageDto } from '../dto/chat.message.dto'
import { ChatDBService } from './chat.db.service'
import { Inject, forwardRef } from '@nestjs/common'

export class ChatService {
    constructor(
        @Inject(forwardRef(() => ChatDBService)) private chatRep: ChatDBService) {}

    async getChats(auth: AuthInfoDto, paginate: PaginateValidateType) {
        return this.chatRep.getChats(auth.id, paginate)
    }

    async getChat(auth: AuthInfoDto, id: number) {
        const chat = await this.chatRep.getChat(id)
        return new ChatDto({ ...chat, messages: chat.messages.map(m => new ChatMessageDto(m)) })
    }

    /** Returns chat object and latest just created message */
    async createChat(auth: AuthInfoDto, { opponentId, providerRequestId }: ChatCreateDto) {
        const chat = await this.chatRep.createChat({
            providerRequest: {
                connect: { id: providerRequestId },
            },
            opponents: [auth.id, opponentId],
            type: ChatType.Order,
        })
        const message = await this.chatRep.createMessage({
            message: 'Chat is created',
            isServer: true,
            chatId: chat.id,
        })

        return new ChatDto({ ...chat, messages: [message] })
    }

    /** Returns chat object and latest just created message */
    async createMessage(auth: AuthInfoDto, dto: ChatMessageCreateDto) {
        const chat = await this.chatRep.getChat(dto.chatId)
        const message = await this.chatRep.createMessage(dto)
        return new ChatDto({ ...chat, messages: [message] })
    }
}
