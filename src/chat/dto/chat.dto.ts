import { Chat, ChatType } from '@prisma/client'
import { ChatMessageDto } from './chat.message.dto'

export class ChatDto implements Chat {
    id: number
    opponents: number[]
    type: ChatType
    providerRequestId: number | null
    messages?: ChatMessageDto[]
    active: boolean
    sourceId: number

    createdAt: Date
    updatedAt: Date

    constructor(partial: Partial<Chat & { messages?: ChatMessageDto[] }>) {
        Object.assign(this, partial)
    }
}
