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

    async createChat(
        userId: number,
        { opponentId, providerRequestId, horecaRequestId, horecaFavouriteId, supportRequestId, ...dto }: ChatCreateDto
    ) {
        return this.db.chat.create({
            data: {
                ...dto,
                ...(providerRequestId
                    ? {
                          providerRequest: {
                              connect: { id: providerRequestId },
                          },
                      }
                    : {}),
                ...(horecaFavouriteId
                    ? {
                          horecaFavourites: {
                              connect: { id: horecaFavouriteId },
                          },
                      }
                    : {}),
                ...(supportRequestId
                    ? {
                          supportRequest: {
                              connect: { id: supportRequestId },
                          },
                      }
                    : {}),
                opponents: [userId, opponentId],
            },
        })
    }

    async getRawById(userId: number, id: number) {
        return this.db.chat.findUnique({
            where: {
                id,
                opponents: {
                    has: userId,
                },
            },
        })
    }

    async getChat(id: number) {
        const chat = await this.db.chat.findUnique({
            where: {
                id,
            },
            include: {
                messages: {
                    orderBy: {
                        createdAt: 'desc',
                    },
                    take: 10,
                },
                providerRequest: {
                    include: {
                        providerRequestReview: true,
                        horecaRequest: true,
                    },
                },
                horecaFavourites: true,
                supportRequest: true,
            },
        })
        return chat
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
        const where: Prisma.ChatWhereInput = {
            opponents: {
                has: opponentId,
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
