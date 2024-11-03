import { Profile, ProfileType } from '@prisma/client'
import { Exclude, Type } from 'class-transformer'
import { TypeValidate, Validate } from '../../../system/utils/validation/validate.decotators'
import { Address } from './address.dto'
import { ValidateNested } from 'class-validator'

export class HorecaProfileDto implements Profile {
    id: number
    userId: number

    @Validate(TypeValidate.STRING, { required: true, enum: ProfileType })
    profileType: ProfileType

    createdAt: Date
    updatedAt: Date

    @Validate(TypeValidate.STRING, { required: false })
    info: string

    @Validate(TypeValidate.ARRAY, { minItems: 1 })
    @ValidateNested()
    @Type(() => Address)
    addresses: Address[]

    @Exclude()
    categories: string[]

    @Exclude()
    deliveryMethods: string[]

    @Exclude()
    minOrderAmount: number

    constructor(partial: Partial<HorecaProfileDto>) {
        Object.assign(this, partial)
    }
}
