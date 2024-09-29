import { ChatType } from '@prisma/client'
import { TypeValidate, Validate } from '../../system/utils/validation/validate.decotators'

export class ChatSupportCreateDto {
    @Validate(TypeValidate.NUMBER)
    sourceId: number
    @Validate(TypeValidate.STRING, { enum: ChatType })
    type: ChatType
}
