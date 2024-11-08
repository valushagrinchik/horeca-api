import { TypeValidate, Validate } from '../../system/utils/validation/validate.decotators'

export class ChatServerMessageCreateDto {
    @Validate(TypeValidate.NUMBER)
    chatId: number

    @Validate(TypeValidate.STRING)
    message: string
}
