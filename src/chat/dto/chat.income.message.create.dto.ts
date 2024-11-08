import { TypeValidate, Validate } from '../../system/utils/validation/validate.decotators'

export class ChatIncomeMessageCreateDto {
    @Validate(TypeValidate.NUMBER)
    chatId: number

    @Validate(TypeValidate.STRING)
    message: string

    @Validate(TypeValidate.NUMBER)
    authorId: number
}
