import { TypeValidate, Validate } from '@/shared/utils'

export class WsMessageCreateDto {
    @Validate(TypeValidate.NUMBER)
    chatId: number

    @Validate(TypeValidate.STRING)
    message: string

    @Validate(TypeValidate.NUMBER)
    authorId: number
}
