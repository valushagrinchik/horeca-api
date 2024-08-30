import { Categories } from '../../system/utils/enums'
import { TypeValidate, Validate } from '../../system/utils/validation/validate.decotators'

export class HorecaRequestItemCreateDto {
    @Validate(TypeValidate.STRING)
    name: string

    @Validate(TypeValidate.NUMBER)
    amount: number

    @Validate(TypeValidate.STRING)
    unit: string

    @Validate(TypeValidate.STRING, { enum: Categories, enumName: 'Categories' })
    category: Categories
}
