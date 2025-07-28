import { Type } from 'class-transformer'
import { ValidateNested } from 'class-validator'
import { TypeValidate, Validate } from '@/shared/utils'
import { Address } from './address.dto'
import { CreateProfileDto } from '../create-profile.dto'

export class CreateHorecaProfileDto extends CreateProfileDto {
    @Validate(TypeValidate.STRING, { required: false })
    info: string

    @Validate(TypeValidate.ARRAY, { minItems: 1 })
    @ValidateNested({ each: true })
    @Type(() => Address)
    addresses: Address[]
}
