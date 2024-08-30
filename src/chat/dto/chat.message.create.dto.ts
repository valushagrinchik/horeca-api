import { TypeValidate, Validate } from '../../system/utils/validation/validate.decotators'

export class ChatMessageCreateDto {
    // @Validate(TypeValidate.NUMBER)
    chatId: number

    // @Validate(TypeValidate.STRING)
    message: string

    // @Validate(TypeValidate.NUMBER, {required: false})
    authorId?: number

    // @Validate(TypeValidate.BOOLEAN, { default: false })
    isServer: boolean = false
}
