import { TypeValidate, Validate } from '@/shared/utils'

export class HorecaRequestSetStatusDto {
    @Validate(TypeValidate.NUMBER)
    horecaRequestId: number
    @Validate(TypeValidate.NUMBER)
    providerRequestId: number
}
