import { PrismaService } from '../prisma.service'
import { AuthInfoDto } from '../users/dto/auth.info.dto'
import { PaginateValidateType } from '../system/swagger/decorators'
import { WebsocketGateway } from '../system/websocket/websocket.gateway'
import { ChatCreateDto } from './dto/chat.create.dto'
import { Chat, ChatType } from '@prisma/client'
import { WebsocketEvents } from '../system/websocket/enums/websocket.events'
import { ChatMessageCreateDto } from './dto/chat.message.create.dto'

export class ChatService {
    constructor(
        private prisma: PrismaService,
        private websocketGateway: WebsocketGateway
    ) {}

    async createChat(auth: AuthInfoDto, dto: ChatCreateDto) {
        const chat = await this.prisma.chat.create({
            data: {...dto, opponents: [ auth.id, dto.opponentId ], type: ChatType.Order}
        })

        return this.createServerMessage(auth, chat, 'Chat is created')
    }

    async createServerMessage(auth: AuthInfoDto, chat: Chat, message: string) {
        return this.createMessage(auth, chat, {
            message, isServer: true
        })
    }

    async createMessage(auth: AuthInfoDto, chat: Chat, dto: ChatMessageCreateDto) {
        const message = await this.prisma.chatMessage.create({ data: {...dto, chatId: chat.id} })
          
        this.websocketGateway.emitToUsers(chat.opponents, WebsocketEvents.CHAT, message)

        return message
    }

    async getChats(auth: AuthInfoDto, paginate: PaginateValidateType) {
        return this.prisma.chat.findMany({
            where: {
                AND: {
                    opponents: {
                        has: auth.id,
                    },
                    NOT: {
                        opponents: {
                            has: -1, // support chats
                        },
                    },
                },
            },
            orderBy: {
                [paginate.sort.field]: paginate.sort.order,
            },
            take: paginate.limit,
            skip: paginate.offset,
        })
    }
}
