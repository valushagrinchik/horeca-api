import { PaginateValidateType } from '../../system/utils/swagger/decorators'
import { Prisma } from '@prisma/client'
import { ChatMessageCreateDto } from '../dto/chat.message.create.dto'
import { DatabaseService } from '../../system/database/database.service'

export class ChatDBService {
    constructor(private db: DatabaseService) {}

    async createChat(input: Prisma.ChatCreateInput) {
        return this.db.chat.create({
            data: input,
        })
    }

    async getChat(id: number, include = { messages: true }) {
        return this.db.chat.findUnique({
            where: { id },
            include,
        })
    }

    async createMessage({ chatId, ...dto }: ChatMessageCreateDto) {
        return this.db.chatMessage.create({ data: { ...dto, chatId } })
    }

    async getChats(opponentId: number, paginate: PaginateValidateType) {
        return this.db.chat.findMany({
            where: {
                AND: {
                    opponents: {
                        has: opponentId,
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
