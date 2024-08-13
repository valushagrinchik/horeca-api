import { Categories } from '../../utils/enums'
import { TypeValidate, Validate } from '../../utils/validation/validate.decotators'

export class ProductSearchDto {
    @Validate(TypeValidate.STRING, { enum: Categories, enumName: 'Categories', required: false })
    category?: Categories
}
