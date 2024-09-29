import { AuthInfoDto } from '../../users/dto/auth.info.dto'
import { PaginateValidateType } from '../../system/utils/swagger/decorators'
import { ChatCreateDto } from '../dto/chat.create.dto'
import { UserRole } from '@prisma/client'
import { ChatMessageCreateDto } from '../dto/chat.message.create.dto'
import { ChatDto } from '../dto/chat.dto'
import { ChatMessageDto } from '../dto/chat.message.dto'
import { ChatDbService } from './chat.db.service'
import { BadRequestException, Inject, forwardRef } from '@nestjs/common'
import { ChatSearchDto } from '../dto/chat.search.dto'
import { ErrorDto } from '../../system/utils/dto/error.dto'
import { ErrorCodes } from '../../system/utils/enums/errorCodes.enum'
import { ChatWsGateway } from '../chat.ws.gateway'
import { WebsocketEvents } from '../../system/utils/enums/websocketEvents.enum'
import { ChatDeactivateDto } from '../dto/chat.deactivate.dto'
import { MESSAGES } from '../messages'

export class ChatService {
    constructor(
        @Inject(forwardRef(() => ChatDbService))
        private chatRep: ChatDbService,
        @Inject(forwardRef(() => ChatWsGateway))
        private ws: ChatWsGateway
    ) {}

    async getChats(auth: AuthInfoDto, paginate: PaginateValidateType<ChatSearchDto>) {
        if (auth.role == UserRole.Admin) {
            return this.chatRep.getSupportChatsForAdmin(auth.id, paginate)
        }
        return this.chatRep.getChats(auth.id, paginate)
    }

    async getChatWithMessages(auth: AuthInfoDto, id: number, paginate: PaginateValidateType) {
        const chat = await this.chatRep.getChatWithPaginatedMessages(auth.id, id, paginate)
        return new ChatDto({ ...chat, messages: chat.messages.map(m => new ChatMessageDto(m)) })
    }

    /** Returns chat object and latest just created message */
    async createChat(auth: AuthInfoDto, dto: ChatCreateDto) {
        const chat = await this.chatRep.createChat(auth.id, dto)
        const message = await this.chatRep.createMessage({
            message: MESSAGES.CHAT_CREATED,
            isServer: true,
            chatId: chat.id,
        })

        this.ws.emitToOpponents(chat.opponents, WebsocketEvents.MESSAGE, message)

        return new ChatDto({ ...chat, messages: [message] })
    }

    async deactivate(auth: AuthInfoDto, dto: ChatDeactivateDto) {
        await this.chatRep.updateChat(
            {
                type_sourceId: {
                    type: dto.type,
                    sourceId: dto.sourceId,
                },
            },
            {
                active: false,
            }
        )
    }

    /** Returns chat object and latest just created message */
    async createMessage(auth: AuthInfoDto, dto: ChatMessageCreateDto) {
        const chat = await this.chatRep.getChat(auth.id, dto.chatId)

        if (!chat.active) {
            throw new BadRequestException(new ErrorDto(ErrorCodes.FORBIDDEN_ACTION))
        }

        const message = await this.chatRep.createMessage(dto)
        const opponentId = chat.opponents.find(o => o != dto.authorId)

        this.ws.emitToOpponent(opponentId, WebsocketEvents.MESSAGE, message)

        return new ChatDto({ ...chat, messages: [message] })
    }
}
