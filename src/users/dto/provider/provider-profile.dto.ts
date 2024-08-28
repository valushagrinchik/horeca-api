import { Address, Profile, ProfileType } from '@prisma/client'
import { Exclude } from 'class-transformer'
import { ArrayMinSize } from 'class-validator'
import { Categories, DeliveryMethods } from '../../../system/enums'
import { TypeValidate, Validate } from '../../../system/validation/validate.decotators'

export class ProviderProfileDto implements Profile {
    id: number
    userId: number

    @Validate(TypeValidate.STRING, { required: true, enum: ProfileType })
    profileType: ProfileType

    createdAt: Date
    updatedAt: Date

    @Validate(TypeValidate.NUMBER)
    minOrderAmount: number

    @Validate(TypeValidate.ARRAY, { minItems: 1, type: [Categories], enum: Categories, enumName: 'Categories' })
    @ArrayMinSize(1)
    categories: Categories[]

    @Validate(TypeValidate.ARRAY, {
        minItems: 1,
        type: [DeliveryMethods],
        enum: DeliveryMethods,
        enumName: 'DeliveryMethods',
    })
    @ArrayMinSize(1)
    deliveryMethods: DeliveryMethods[]

    @Exclude()
    info: string | null

    @Exclude()
    addresses: Address[]

    constructor(partial: Partial<ProviderProfileDto>) {
        Object.assign(this, partial)
    }
}
