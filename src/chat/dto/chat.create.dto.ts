import { ChatType } from '@prisma/client'
import { TypeValidate, Validate } from '../../system/utils/validation/validate.decotators'
import { ValidateIf } from 'class-validator'

export class ChatCreateDto {
    @Validate(TypeValidate.NUMBER)
    opponentId: number

    @Validate(TypeValidate.NUMBER, { required: false })
    @ValidateIf(o => o.type == ChatType.Order)
    providerRequestId?: number
    @Validate(TypeValidate.NUMBER, { required: false })
    @ValidateIf(o => o.type == ChatType.Order)
    horecaRequestId?: number

    @Validate(TypeValidate.NUMBER, { required: false })
    @ValidateIf(o => o.type == ChatType.Private)
    horecaFavouriteId?: number

    @Validate(TypeValidate.NUMBER, { required: false })
    @ValidateIf(o => o.type == ChatType.Support)
    supportRequestId?: number

    @Validate(TypeValidate.STRING, { enum: ChatType })
    type: ChatType
}
