import { ChatType } from '@prisma/client'
import { TypeValidate, Validate } from '../../utils/validation/validate.decotators'

export class CreateChatDto {
    @Validate(TypeValidate.NUMBER)
    orderId: number

    @Validate(TypeValidate.NUMBER)
    senderId: number

    @Validate(TypeValidate.NUMBER)
    receiverId: number

    @Validate(TypeValidate.STRING)
    type: ChatType
}