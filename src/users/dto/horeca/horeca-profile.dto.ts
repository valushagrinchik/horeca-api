import {  Profile, ProfileType } from '@prisma/client'
import { Exclude, Type } from 'class-transformer'
import { ArrayMinSize, ValidateNested } from 'class-validator'
import { TypeValidate, Validate } from 'src/utils/validation/validate.decotators'
import { Address } from './address.dto'

export class HorecaProfileDto implements Profile {
    id: number
    userId: number
    profileType: ProfileType
    
    @Validate(TypeValidate.STRING, {required: false})
    info: string

    @Validate(TypeValidate.ARRAY, {minItems: 1, type: [Address]})
    @ValidateNested({ each: true })
    @Type(() => Address)
    @ArrayMinSize(1)
    addresses: Address[]

    @Exclude()
    categories: string[];

    @Exclude()
    deliveryMethods: string[];

    @Exclude()
    minOrderAmount: number

    constructor(partial: Partial<HorecaProfileDto>) {
        Object.assign(this, partial)
    }
}

