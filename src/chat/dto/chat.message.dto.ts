import { ChatMessage } from '@prisma/client'

export class ChatMessageDto implements ChatMessage {
    id: number
    chatId: number
    message: string
    authorId: number | null
    isServer: boolean = false
    createdAt: Date
    updatedAt: Date

    constructor(partial: Partial<ChatMessage>) {
        Object.assign(this, partial)
    }
}
