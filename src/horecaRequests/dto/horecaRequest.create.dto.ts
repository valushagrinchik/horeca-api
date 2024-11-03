import { PaymentType } from '@prisma/client'
import { TypeValidate, Validate } from '../../system/utils/validation/validate.decotators'
import { HorecaRequestItemCreateDto } from './horecaRequest.item.create.dto'
import { Type } from 'class-transformer'

export class HorecaRequestCreateDto {
    @Validate(TypeValidate.ARRAY, { minItems: 1 })
    @Type(() => HorecaRequestItemCreateDto)
    items: HorecaRequestItemCreateDto[]

    @Validate(TypeValidate.ARRAY, { type: [Number], default: [] })
    imageIds?: number[] = []

    @Validate(TypeValidate.STRING)
    address: string

    @Validate(TypeValidate.DATE)
    deliveryTime: Date

    @Validate(TypeValidate.DATE)
    acceptUntill: Date

    @Validate(TypeValidate.STRING, { enum: PaymentType })
    paymentType: PaymentType

    @Validate(TypeValidate.STRING)
    name: string

    @Validate(TypeValidate.STRING)
    phone: string

    @Validate(TypeValidate.STRING, { required: false })
    comment: string
}
