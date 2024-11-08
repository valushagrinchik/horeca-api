import { TypeValidate, Validate } from '../../system/utils/validation/validate.decotators'

export class ChatMessageSearchDto {
    @Validate(TypeValidate.NUMBER)
    chatId: number
}
