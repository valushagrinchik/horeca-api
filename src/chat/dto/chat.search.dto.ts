import { ChatType } from '@prisma/client'
import { ValidateEnum, Validate, TypeValidate } from '@/shared/utils'
import { ValidateIf } from 'class-validator'

export class ChatSearchDto {
    @ValidateEnum(ChatType, {
        enum: ChatType,
        enumName: 'ChatType',
        description: 'Required when chatParticipantId is not defined',
    })
    @ValidateIf(o => !o.chatParticipantId)
    type?: ChatType

    @Validate(TypeValidate.NUMBER, { description: 'Required when type is not defined' })
    @ValidateIf(o => !o.type)
    chatParticipantId?: number
}
