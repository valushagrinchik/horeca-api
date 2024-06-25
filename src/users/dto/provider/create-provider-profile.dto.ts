import { ArrayMinSize, ValidateIf } from 'class-validator'
import { Categories, DeliveryMethods } from 'src/utils/constants'
import { TypeValidate, Validate } from 'src/utils/validation/validate.decotators'
import { Profile } from '../profile.dto'

export class CreateProviderProfileDto extends Profile {
    @Validate(TypeValidate.NUMBER)
    @ValidateIf(o => o.profileType)
    minOrderAmount: number

    @Validate(TypeValidate.ARRAY, { minItems: 1, type: [Categories], enum: Categories, enumName: 'Categories'})
    @ValidateIf(o => o.profileType)
    @ArrayMinSize(1)
    categories: Categories[]

    @Validate(TypeValidate.ARRAY, { minItems: 1, type: [DeliveryMethods], enum: DeliveryMethods, enumName: 'DeliveryMethods' })
    @ValidateIf(o => o.profileType)
    @ArrayMinSize(1)
    deliveryMethods: DeliveryMethods[]

    constructor(partial: Partial<CreateProviderProfileDto>) {
        super(partial)
        Object.assign(this, partial)
    }
}