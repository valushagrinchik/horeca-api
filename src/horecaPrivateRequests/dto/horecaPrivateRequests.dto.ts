import { Validate, TypeValidate } from '@/shared/utils'

export class HorecaPrivateRequestDto {
    @Validate(TypeValidate.NUMBER)
    horecaRequestId: number
    @Validate(TypeValidate.NUMBER)
    providerRequestId: number

    constructor(partial: Partial<HorecaPrivateRequestDto>) {
        Object.assign(this, partial)
    }
}
