import { TypeValidate, Validate } from '../../utils/validation/validate.decotators'

export class CreateChatMessageDto {
    @Validate(TypeValidate.NUMBER)
    chatId: number

    @Validate(TypeValidate.STRING)
    message: string
}