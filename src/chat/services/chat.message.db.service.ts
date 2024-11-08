import { Prisma } from '@prisma/client'
import { DatabaseService } from '../../system/database/database.service'
import { forwardRef, Inject } from '@nestjs/common'

export class ChatMessageDbService {
    constructor(
        @Inject(forwardRef(() => DatabaseService))
        private db: DatabaseService
    ) {}

    async get(id: number) {
        return this.db.chatMessage.findUnique({
            where: { id },
            include: { chat: true },
        })
    }

    async getChatMessages(args: Prisma.ChatMessageFindManyArgs) {
        return this.db.chatMessage.findMany(args)
    }
    async countChatMessages(args: Prisma.ChatMessageCountArgs) {
        return this.db.chatMessage.count(args)
    }

    async update(id: number, data: Prisma.ChatMessageUpdateInput) {
        return this.db.chatMessage.update({
            where: {
                id,
            },
            data,
        })
    }
}
