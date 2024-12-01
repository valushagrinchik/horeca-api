import { Validate, TypeValidate } from '../../system/utils/validation/validate.decotators'

export class HorecaPrivateRequestDto {
    @Validate(TypeValidate.NUMBER)
    horecaRequestId: number
    @Validate(TypeValidate.NUMBER)
    providerRequestId: number

    constructor(partial: Partial<HorecaPrivateRequestDto>) {
        Object.assign(this, partial)
    }
}
