import { Categories, DeliveryMethods, TypeValidate, Validate } from '@/shared/utils'
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
