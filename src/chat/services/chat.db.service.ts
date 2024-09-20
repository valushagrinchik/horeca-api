import { PaginateValidateType } from '../../system/utils/swagger/decorators'
import { ChatType, Prisma } from '@prisma/client'
import { DatabaseService } from '../../system/database/database.service'
import { forwardRef, Inject } from '@nestjs/common'
import { ChatSearchDto } from '../dto/chat.search.dto'
import { ChatCreateDto } from '../dto/chat.create.dto'

export class ChatDbService {
    constructor(
        @Inject(forwardRef(() => DatabaseService)) // TODO: try to delete after migration of using db repository approach
        private db: DatabaseService
    ) {}

    async createChat(userId: number, { opponentId, horecaRequestId, ...dto }: ChatCreateDto) {
        return this.db.chat.create({
            data: {
                ...dto,
                horecaRequest: {
                    connect: { id: horecaRequestId },
                },
                opponents: [userId, opponentId],
            },
        })
    }

    async getChat(userId: number, id: number) {
        return this.db.chat.findUnique({
            where: {
                id,
                opponents: {
                    has: userId,
                },
            },
        })
    }

    async getChatWithPaginatedMessages(userId: number, id: number, paginate: PaginateValidateType) {
        return this.db.chat.findUnique({
            where: {
                id,
                opponents: {
                    has: userId,
                },
            },
            include: {
                messages: {
                    orderBy: {
                        createdAt: 'desc',
                        [paginate.sort.field]: paginate.sort.order,
                    },
                    take: paginate.limit,
                    skip: paginate.offset,
                },
            },
        })
    }

    async createMessage({ chatId, ...data }: Omit<Prisma.ChatMessageCreateInput, 'chat'> & { chatId: number }) {
        return this.db.chatMessage.create({
            data: {
                ...data,
                chat: {
                    connect: { id: chatId },
                },
            },
        })
    }

    async getChats(opponentId: number, paginate: PaginateValidateType<ChatSearchDto>) {
        const search = paginate.search || { type: ChatType.Order }
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
                type: search.type,
            },
            orderBy: {
                [paginate.sort.field]: paginate.sort.order,
            },
            take: paginate.limit,
            skip: paginate.offset,
        })
    }
}
