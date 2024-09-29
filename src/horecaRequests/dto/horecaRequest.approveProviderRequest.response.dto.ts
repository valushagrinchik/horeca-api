import { ProviderRequestDto } from '../../providerRequests/dto/providerRequest.dto'
import { TypeValidate, Validate } from '../../system/utils/validation/validate.decotators'
import { ChatDto } from '../../chat/dto/chat.dto'

export class HorecaRequestApproveProviderRequestResponseDto {
    @Validate(TypeValidate.OBJECT, { type: ProviderRequestDto })
    providerRequest: ProviderRequestDto
    @Validate(TypeValidate.OBJECT, { type: ChatDto })
    chat: ChatDto

    constructor(partial: Partial<HorecaRequestApproveProviderRequestResponseDto>) {
        Object.assign(this, partial)
    }
}
