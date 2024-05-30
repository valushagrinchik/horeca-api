import { Type } from 'class-transformer'
import { ArrayMinSize, ValidateNested } from 'class-validator'
import { TypeValidate, Validate } from 'src/utils/validation/validate.decotators'
import { Address } from './address.dto'

export class CreateHorecaProfileDto  {
    @Validate(TypeValidate.STRING, {required: false})
    info: string

    @Validate(TypeValidate.ARRAY, {minItems: 1, type: [Address]})
    @ValidateNested({ each: true })
    @Type(() => Address)
    @ArrayMinSize(1)
    addresses: Address[]

    constructor(partial: Partial<CreateHorecaProfileDto>) {
        Object.assign(this, partial)
    }
}

