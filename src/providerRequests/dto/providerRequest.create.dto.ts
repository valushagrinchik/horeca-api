import { TypeValidate, Validate } from '../../system/utils/validation/validate.decotators'
import { ProviderRequestItemCreateDto } from './providerRequest.item.create.dto'

export class ProviderRequestCreateDto {
    @Validate(TypeValidate.NUMBER)
    horecaRequestId: number

    @Validate(TypeValidate.STRING, { required: false })
    comment: string

    @Validate(TypeValidate.ARRAY, { type: [ProviderRequestItemCreateDto] })
    items: ProviderRequestItemCreateDto[]
}
