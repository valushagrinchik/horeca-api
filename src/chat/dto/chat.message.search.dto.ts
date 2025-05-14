import { TypeValidate, Validate } from '@/shared/utils'

export class ChatMessageSearchDto {
    @Validate(TypeValidate.NUMBER)
    chatId: number
}
