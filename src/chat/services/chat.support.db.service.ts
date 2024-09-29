import { DatabaseService } from '../../system/database/database.service'
import { forwardRef, Inject } from '@nestjs/common'
import { ChatSupportCreateDto } from '../dto/chat.support.create.dto'
import { ChatDbService } from './chat.db.service'

export class ChatSupportDbService extends ChatDbService {
    constructor(
        @Inject(forwardRef(() => DatabaseService))
        protected db: DatabaseService
    ) {
        super(db)
    }

    async createChat(userId: number, dto: ChatSupportCreateDto) {
        return this.db.chat.create({
            data: {
                ...dto,
                opponents: [userId],
            },
        })
    }
}
