import { TypeValidate, Validate } from "../../system/utils/validation/validate.decotators"

export class ChatCreateDto {   
    @Validate(TypeValidate.NUMBER)
    opponentId: number
    @Validate(TypeValidate.NUMBER, { required: false})
    providerRequestId?: number
}
