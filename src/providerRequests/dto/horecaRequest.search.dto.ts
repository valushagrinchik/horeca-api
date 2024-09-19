import { TypeValidate, Validate } from '../../system/utils/validation/validate.decotators'

export class HorecaRequestSearchDto {
    @Validate(TypeValidate.BOOLEAN, { default: false })
    inactive?: boolean = false
}
