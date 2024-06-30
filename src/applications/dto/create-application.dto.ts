import { PaymentType } from "@prisma/client"
import { TypeValidate, Validate } from "src/utils/validation/validate.decotators"

export class CreateApplicationDto {
    @Validate(TypeValidate.NUMBER)
    proposalId: number

    @Validate(TypeValidate.ARRAY, {type: [Number]})
    imageIds: number[]

    @Validate(TypeValidate.STRING, {required: false})
    comment: string

    @Validate(TypeValidate.BOOLEAN)
    available: boolean

    @Validate(TypeValidate.STRING)
    manufacturer: string

    @Validate(TypeValidate.STRING, {type: PaymentType})
    paymentType:  PaymentType   

    @Validate(TypeValidate.NUMBER)
    cost: number
}




