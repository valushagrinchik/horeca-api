import { PaymentType } from '@prisma/client'
import { ValidateNested } from 'class-validator'
import { Categories } from 'src/utils/constants'
import { TypeValidate, Validate } from 'src/utils/validation/validate.decotators'

class CreateProposalItemHorecaDto {
    @Validate(TypeValidate.STRING)
    name: string

    @Validate(TypeValidate.NUMBER)
    amount: number

    @Validate(TypeValidate.STRING)
    unit: string

    @Validate(TypeValidate.STRING, {enum: Categories, enumName: 'Categories'})
    category: Categories
}

export class CreateProposalHorecaDto {
    @Validate(TypeValidate.ARRAY, {minItems: 1, type: [CreateProposalItemHorecaDto]})
    @ValidateNested()
    items: CreateProposalItemHorecaDto[]

    @Validate(TypeValidate.ARRAY, {type: [Number]})
    imageIds: number[]

    @Validate(TypeValidate.STRING)
    address: string

    @Validate(TypeValidate.DATE)
    deliveryTime:  Date  

    @Validate(TypeValidate.DATE)
    acceptUntill:  Date   

    @Validate(TypeValidate.STRING, {enum: PaymentType})
    paymentType:  PaymentType 

    @Validate(TypeValidate.STRING)
    name: string

    @Validate(TypeValidate.STRING)
    phone: string

    @Validate(TypeValidate.STRING, {required: false})
    comment: string
}
