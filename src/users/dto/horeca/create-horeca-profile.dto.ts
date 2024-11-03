import { Type } from 'class-transformer'
import { ValidateIf } from 'class-validator'
import { TypeValidate, Validate } from '../../../system/utils/validation/validate.decotators'
import { Address } from './address.dto'
import { Profile } from '../profile.dto'

export class CreateHorecaProfileDto extends Profile {
    @Validate(TypeValidate.STRING, { required: false })
    @ValidateIf(o => o.profileType)
    info: string

    @Validate(TypeValidate.ARRAY, { minItems: 1 })
    @ValidateIf(o => o.profileType)
    @Type(() => Address)
    addresses: Address[]

    constructor(partial: Partial<CreateHorecaProfileDto>) {
        super(partial)
        Object.assign(this, partial)
    }
}
