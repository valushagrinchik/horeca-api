import { TypeValidate, Validate } from '@/shared/utils'

export class ChatServerMessageCreateDto {
    @Validate(TypeValidate.NUMBER)
    chatId: number

    @Validate(TypeValidate.STRING)
    message: string

    @Validate(TypeValidate.ARRAY)
    opponents?: number[]
}
