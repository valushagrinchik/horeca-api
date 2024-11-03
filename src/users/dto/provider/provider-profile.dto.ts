import { Address, Profile, ProfileType } from '@prisma/client'
import { Exclude } from 'class-transformer'
import { Categories, DeliveryMethods } from '../../../system/utils/enums'
import { TypeValidate, Validate } from '../../../system/utils/validation/validate.decotators'

export class ProviderProfileDto implements Profile {
    id: number
    userId: number

    @Validate(TypeValidate.STRING, { required: true, enum: ProfileType })
    profileType: ProfileType

    createdAt: Date
    updatedAt: Date

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

    @Exclude()
    info: string | null

    @Exclude()
    addresses: Address[]

    constructor(partial: Partial<ProviderProfileDto>) {
        Object.assign(this, partial)
    }
}
