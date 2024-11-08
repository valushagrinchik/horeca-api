import { Chat, ChatType } from '@prisma/client'
import { ChatMessageDto } from './chat.message.dto'
import { ApiProperty } from '@nestjs/swagger'
import { Validate, TypeValidate } from '../../system/utils/validation/validate.decotators'

export class ChatDto implements Chat {
    id: number
    @Validate(TypeValidate.ARRAY)
    opponents: number[]
    @ApiProperty({ enum: ChatType, enumName: 'ChatType' })
    type: ChatType
    messages: ChatMessageDto[]
    active: boolean

    createdAt: Date
    updatedAt: Date

    constructor(partial: Partial<Chat & { messages: ChatMessageDto[] }>) {
        Object.assign(this, partial)
    }
}
