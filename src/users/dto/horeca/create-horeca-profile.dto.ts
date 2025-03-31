import { Type } from 'class-transformer'
import { ValidateIf, ValidateNested } from 'class-validator'
import { TypeValidate, Validate } from '../../../system/utils/validation/validate.decotators'
import { Address } from './address.dto'
import { CreateProfileDto } from '../create-profile.dto'

export class CreateHorecaProfileDto extends CreateProfileDto {
    @Validate(TypeValidate.STRING, { required: false })
    info: string

    @Validate(TypeValidate.ARRAY, { minItems: 1 })
    @ValidateNested()
    @Type(() => Address)
    addresses: Address[]
}
