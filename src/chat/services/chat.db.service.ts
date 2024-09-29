import { PaginateValidateType } from '../../system/utils/swagger/decorators'
import { ChatType, Prisma } from '@prisma/client'
import { DatabaseService } from '../../system/database/database.service'
import { forwardRef, Inject } from '@nestjs/common'
import { ChatSearchDto } from '../dto/chat.search.dto'
import { ChatCreateDto } from '../dto/chat.create.dto'

export class ChatDbService {
    constructor(
        // @Inject(forwardRef(() => DatabaseService))
        protected db: DatabaseService
    ) {}

    async createChat(userId: number, { opponentId, ...dto }: ChatCreateDto) {
        return this.db.chat.create({
            data: {
                ...dto,
                opponents: [userId, opponentId].filter(o => !!o),
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

    async findChat(where: Prisma.ChatWhereInput) {
        return this.db.chat.findFirst({
            where,
        })
    }

    async updateChat(where: Prisma.ChatWhereUniqueInput, data: Prisma.ChatUpdateInput) {
        return this.db.chat.update({
            where,
            data,
        })
    }

    async getChatWithPaginatedMessages(userId: number, id: number, paginate: PaginateValidateType) {
        return this.db.chat.findUnique({
            where: {
                id,
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

    async getChats(userId: number, paginate: PaginateValidateType<ChatSearchDto>) {
        const search = paginate.search || { type: ChatType.Order }
        return this.db.chat.findMany({
            where: {
                AND: {
                    opponents: {
                        has: userId,
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

    async getSupportChatsForAdmin(userId: number, paginate: PaginateValidateType<ChatSearchDto>) {
        return this.db.chat.findMany({
            where: {
                type: ChatType.Support,
            },
            orderBy: {
                createdAt: 'desc',
                [paginate.sort.field]: paginate.sort.order,
            },
            take: paginate.limit,
            skip: paginate.offset,
        })
    }

    // async assignOpponent(userId: number, id: number) {
    //     return this.db.chat.update({
    //         where: {
    //             id,
    //         },
    //         data: {
    //             opponents: {
    //                 push: userId,
    //             },
    //         },
    //     })
    // }
}
