import { Categories, DeliveryMethods } from '../../../system/utils/enums'
import { TypeValidate, Validate } from '../../../system/utils/validation/validate.decotators'
import { CreateProfileDto } from '../create-profile.dto'

export class CreateProviderProfileDto extends CreateProfileDto {
    @Validate(TypeValidate.NUMBER)
    minOrderAmount: number

    @Validate(TypeValidate.ARRAY, { minItems: 1, enum: Categories, enumName: 'Categories' })
    categories: Categories[]

    @Validate(TypeValidate.ARRAY, {
        minItems: 1,
        enum: DeliveryMethods,
        enumName: 'DeliveryMethods',
    })
    deliveryMethods: DeliveryMethods[]
}
