import { ChatMessage } from '@prisma/client'
import { UserDto } from '../../users/dto/user.dto'

export class ChatMessageDto implements ChatMessage {
    id: number
    chatId: number
    message: string
    authorId: number | null
    author?: UserDto | null
    isServer: boolean = false
    opponentViewed: boolean = false
    createdAt: Date
    updatedAt: Date

    constructor(partial: Partial<ChatMessage>) {
        Object.assign(this, partial)
    }
}
