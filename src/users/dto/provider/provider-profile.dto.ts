import { Address, Profile, ProfileType } from '@prisma/client'
import { Exclude } from 'class-transformer'
import { Categories, DeliveryMethods, TypeValidate, Validate } from '@/shared/utils'
import { ApiHideProperty } from '@nestjs/swagger'

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

    @ApiHideProperty()
    @Exclude()
    info: string | null

    @ApiHideProperty()
    @Exclude()
    addresses: Address[]

    constructor(partial: Partial<ProviderProfileDto>) {
        Object.assign(this, partial)
    }
}
