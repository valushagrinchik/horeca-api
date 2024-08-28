import { TypeValidate, Validate } from '../../utils/validation/validate.decotators'

export class ChatMessageCreateDto {
    @Validate(TypeValidate.STRING)
    message: string

    @Validate(TypeValidate.NUMBER, {required: false})
    authorId?: number

    @Validate(TypeValidate.BOOLEAN, { default: false })
    isServer: boolean
}