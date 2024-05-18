import { TypeValidate, Validate } from 'src/utils/validation/validate.decotators'

export class ProviderProfileDto {
    @Validate(TypeValidate.STRING)
    info: string

    @Validate(TypeValidate.NUMBER)
    minOrderAmount: number

    @Validate(TypeValidate.ARRAY, { type: [String] })
    deliveryMethods: string[]

    @Validate(TypeValidate.ARRAY, { type: [String] })
    categories: string[]
}
