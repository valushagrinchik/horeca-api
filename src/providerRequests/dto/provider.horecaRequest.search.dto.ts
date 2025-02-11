import { Categories } from '../../system/utils/enums'
import { TypeValidate, Validate, ValidateEnum } from '../../system/utils/validation/validate.decotators'

export class ProviderHorecaRequestSearchDto {
    @Validate(TypeValidate.BOOLEAN, { required: false })
    hiddenAndViewed?: boolean

    @ValidateEnum(Categories, { enum: Categories, enumName: 'Categories' })
    category?: Categories
}
