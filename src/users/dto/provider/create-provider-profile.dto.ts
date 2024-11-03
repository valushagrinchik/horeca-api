import { ValidateIf } from 'class-validator'
import { Categories, DeliveryMethods } from '../../../system/utils/enums'
import { TypeValidate, Validate } from '../../../system/utils/validation/validate.decotators'
import { Profile } from '../profile.dto'

export class CreateProviderProfileDto extends Profile {
    @Validate(TypeValidate.NUMBER)
    @ValidateIf(o => o.profileType)
    minOrderAmount: number

    @Validate(TypeValidate.ARRAY, { minItems: 1, type: [Categories], enum: Categories, enumName: 'Categories' })
    @ValidateIf(o => o.profileType)
    categories: Categories[]

    @Validate(TypeValidate.ARRAY, {
        minItems: 1,
        type: [DeliveryMethods],
        enum: DeliveryMethods,
        enumName: 'DeliveryMethods',
    })
    @ValidateIf(o => o.profileType)
    deliveryMethods: DeliveryMethods[]

    constructor(partial: Partial<CreateProviderProfileDto>) {
        super(partial)
        Object.assign(this, partial)
    }
}
