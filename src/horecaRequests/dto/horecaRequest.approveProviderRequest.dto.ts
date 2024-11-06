import { TypeValidate, Validate } from '../../system/utils/validation/validate.decotators'

export class HorecaRequestSetStatusDto {
    @Validate(TypeValidate.NUMBER)
    horecaRequestId: number
    @Validate(TypeValidate.NUMBER)
    providerRequestId: number
}
