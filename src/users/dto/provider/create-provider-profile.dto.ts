import { ArrayMinSize } from 'class-validator'
import { Categories, DeliveryMethods } from 'src/utils/constants'
import { TypeValidate, Validate } from 'src/utils/validation/validate.decotators'

export class CreateProviderProfileDto {
    @Validate(TypeValidate.NUMBER)
    minOrderAmount: number

    @Validate(TypeValidate.ARRAY, { minItems: 1, type: [Categories], enum: Categories, enumName: 'Categories'})
    @ArrayMinSize(1)
    categories: Categories[]

    @Validate(TypeValidate.ARRAY, { minItems: 1, type: [DeliveryMethods], enum: DeliveryMethods, enumName: 'DeliveryMethods' })
    @ArrayMinSize(1)
    deliveryMethods: DeliveryMethods[]

    constructor(partial: Partial<CreateProviderProfileDto>) {
        Object.assign(this, partial)
    }
}