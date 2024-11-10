import { TypeValidate, Validate } from '../../system/utils/validation/validate.decotators'

export class WsMessageCreateDto {
    @Validate(TypeValidate.NUMBER)
    chatId: number

    @Validate(TypeValidate.STRING)
    message: string

    @Validate(TypeValidate.NUMBER)
    authorId: number
}
