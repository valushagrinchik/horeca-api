import { Categories } from '../../system/utils/enums'
import { TypeValidate, Validate, ValidateEnum } from '../../system/utils/validation/validate.decotators'

export class ProviderHorecaRequestSearchDto {
    @Validate(TypeValidate.BOOLEAN, { default: false })
    includeHiddenAndViewed?: boolean = false

    @ValidateEnum(Categories, { enum: Categories, enumName: 'Categories' })
    category?: Categories
}
