import { ChatDto } from '../../chat/dto/chat.dto'
import { TypeValidate, Validate } from '../../system/utils/validation/validate.decotators'
import { SupportRequestDto } from './supportRequest.dto'

export class SupportRequestCreateResponseDto {
    @Validate(TypeValidate.OBJECT, { type: SupportRequestDto })
    supportRequest: SupportRequestDto
    @Validate(TypeValidate.OBJECT, { type: ChatDto })
    chat: ChatDto

    constructor(partial: Partial<SupportRequestCreateResponseDto>) {
        Object.assign(this, partial)
    }
}
