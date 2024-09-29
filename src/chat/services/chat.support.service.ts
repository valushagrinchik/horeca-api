import { AuthInfoDto } from '../../users/dto/auth.info.dto'
import { ChatDto } from '../dto/chat.dto'
import { ChatDbService } from './chat.db.service'
import { Inject, forwardRef } from '@nestjs/common'

import { ChatWsGateway } from '../chat.ws.gateway'
import { WebsocketEvents } from '../../system/utils/enums/websocketEvents.enum'
import { ChatType } from '@prisma/client'
import { ChatSupportDbService } from './chat.support.db.service'
import { MESSAGES } from '../messages'

export class ChatSupportService {
    constructor(
        @Inject(forwardRef(() => ChatDbService))
        private chatRep: ChatSupportDbService,
        private ws: ChatWsGateway
    ) {}

    async createChat(auth: AuthInfoDto, sourceId: number) {
        const chat = await this.chatRep.createChat(auth.id, {
            type: ChatType.Support,
            sourceId,
        })
        const message = await this.chatRep.createMessage({
            message: MESSAGES.SUPPORT_CHAT_CREATED,
            isServer: true,
            chatId: chat.id,
        })

        this.ws.emitToOpponents(chat.opponents, WebsocketEvents.MESSAGE, message)

        return new ChatDto({ ...chat, messages: [message] })
    }

    async assignAdminToSupportChat(auth: AuthInfoDto, supportRequestId: number) {
        const chat = await this.chatRep.findChat({
            type: ChatType.Support,
            sourceId: supportRequestId,
        })

        const updated = await this.chatRep.updateChat(
            { id: chat.id },
            {
                opponents: {
                    push: auth.id,
                },
            }
        )

        const message = await this.chatRep.createMessage({
            message: MESSAGES.SUPPORT_CHAT_ADMIN_ASSIGNED,
            authorId: auth.id,
            chatId: chat.id,
        })

        this.ws.emitToOpponents(updated.opponents, WebsocketEvents.MESSAGE, message)

        return new ChatDto({ ...updated, messages: [message] })
    }
}
