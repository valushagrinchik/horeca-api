import { PaginateValidateType } from '../../system/utils/swagger/decorators'
import { AuthInfoDto } from '../../users/dto/auth.info.dto'
import { ChatMessageDto } from '../dto/chat.message.dto'
import { ChatMessageSearchDto } from '../dto/chat.message.search.dto'
import { ChatMessageDbService } from './chat.message.db.service'
import { BadRequestException, forwardRef, Inject } from '@nestjs/common'
import { ErrorDto } from '../../system/utils/dto/error.dto'
import { ErrorCodes } from '../../system/utils/enums/errorCodes.enum'

export class ChatMessageService {
    constructor(
        @Inject(forwardRef(() => ChatMessageDbService))
        private chatMessageRep: ChatMessageDbService
    ) {}

    async getChatMessages(
        auth: AuthInfoDto,
        paginate: PaginateValidateType<ChatMessageSearchDto>
    ): Promise<[ChatMessageDto[], number]> {
        const { chatId } = paginate.search
        const where = {
            chatId,
            chat: {
                opponents: {
                    has: auth.id,
                },
            },
        }
        const data = await this.chatMessageRep.getChatMessages({
            where,
            orderBy: {
                createdAt: 'desc',
                [paginate.sort.field]: paginate.sort.order,
            },
            take: paginate.limit,
            skip: paginate.offset,
        })
        const total = await this.chatMessageRep.countChatMessages({ where })
        return [data, total]
    }

    async viewMessage(auth: AuthInfoDto, messageId: number) {
        const message = await this.chatMessageRep.get(messageId)
        const isOpponent = message.chat.opponents.includes(auth.id) && auth.id != message.authorId
        if (!isOpponent) {
            throw new BadRequestException(new ErrorDto(ErrorCodes.FORBIDDEN_ACTION))
        }
        await this.chatMessageRep.update(messageId, {
            opponentViewed: true,
        })
    }
}
