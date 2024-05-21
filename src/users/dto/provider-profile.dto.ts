import { Categories, DeliveryMethods } from 'src/utils/constants'
import { TypeValidate, Validate } from 'src/utils/validation/validate.decotators'

export class ProviderProfileDto {
    @Validate(TypeValidate.STRING)
    info: string

    @Validate(TypeValidate.NUMBER)
    minOrderAmount: number

    @Validate(TypeValidate.ARRAY, { type: [DeliveryMethods], enum: DeliveryMethods, enumName: 'DeliveryMethods' })
    deliveryMethods: string[]

    @Validate(TypeValidate.ARRAY, { type: [Categories], enum: Categories, enumName: 'Categories'})
    categories: string[]
}
