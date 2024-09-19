import { TypeValidate, Validate } from '../../system/utils/validation/validate.decotators'

export class HorecaRequestProviderStatusDto {
    @Validate(TypeValidate.NUMBER)
    horecaRequestId: number

    @Validate(TypeValidate.BOOLEAN, { required: false })
    viewed?: boolean

    @Validate(TypeValidate.BOOLEAN, { required: false })
    hidden?: boolean
}
