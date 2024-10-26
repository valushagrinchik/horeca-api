import { PaginateValidateType } from '../../system/utils/swagger/decorators'
import { ChatType, Prisma } from '@prisma/client'
import { DatabaseService } from '../../system/database/database.service'
import { forwardRef, Inject } from '@nestjs/common'
import { ChatSearchDto } from '../dto/chat.search.dto'
import { ChatCreateDto } from '../dto/chat.create.dto'
import { ChatDto } from '../dto/chat.dto'

export class ChatDbService {
    constructor(
        @Inject(forwardRef(() => DatabaseService))
        private db: DatabaseService
    ) {}

    async createChat(userId: number, { opponentId, horecaRequestId, ...dto }: ChatCreateDto) {
        return this.db.chat.create({
            data: {
                ...dto,
                ...(horecaRequestId
                    ? {
                          horecaRequest: {
                              connect: { id: horecaRequestId },
                          },
                      }
                    : {}),
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
            include: {
                messages: {
                    orderBy: {
                        createdAt: 'desc',
                    },
                    take: 10,
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

    async getChatMessages(args: Prisma.ChatMessageFindManyArgs) {
        return this.db.chatMessage.findMany(args)
    }
    async countChatMessages(args: Prisma.ChatMessageCountArgs) {
        return this.db.chatMessage.count(args)
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

    async findAllAndCount(
        opponentId: number,
        paginate: PaginateValidateType<ChatSearchDto>
    ): Promise<[ChatDto[], number]> {
        const search = paginate.search || { type: ChatType.Order }
        const where = {
            AND: {
                opponents: {
                    has: opponentId,
                },
            },
            type: search.type,
        }
        const data = await this.db.chat.findMany({
            where,
            orderBy: {
                [paginate.sort.field]: paginate.sort.order,
            },
            take: paginate.limit,
            skip: paginate.offset,
        })
        const total = await this.db.chat.count({
            where,
        })
        return [data.map(chat => new ChatDto(chat)), total]
    }
}
