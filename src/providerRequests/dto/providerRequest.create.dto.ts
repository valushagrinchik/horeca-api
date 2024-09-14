import { PaymentType } from '@prisma/client'
import { TypeValidate, Validate } from '../../system/utils/validation/validate.decotators'

export class ProviderRequestCreateDto {
    @Validate(TypeValidate.NUMBER)
    horecaRequestId: number

    @Validate(TypeValidate.ARRAY, { type: [Number] })
    imageIds: number[]

    @Validate(TypeValidate.STRING, { required: false })
    comment: string

    @Validate(TypeValidate.BOOLEAN)
    available: boolean

    @Validate(TypeValidate.STRING)
    manufacturer: string

    @Validate(TypeValidate.STRING, { enum: PaymentType, enumName: 'PaymentType' })
    paymentType: PaymentType

    @Validate(TypeValidate.NUMBER)
    cost: number
}
