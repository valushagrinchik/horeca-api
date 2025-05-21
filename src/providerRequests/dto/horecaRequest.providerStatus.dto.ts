import { TypeValidate, Validate } from '@/shared/utils'

export class HorecaRequestProviderStatusDto {
    @Validate(TypeValidate.NUMBER)
    horecaRequestId: number

    @Validate(TypeValidate.BOOLEAN, { required: false, deprecated: true })
    viewed?: boolean

    @Validate(TypeValidate.BOOLEAN, { required: false })
    hidden?: boolean
}
