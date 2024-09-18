import { TypeValidate, Validate } from '../../system/utils/validation/validate.decotators'

export class ProviderRequestItemCreateDto {
    @Validate(TypeValidate.ARRAY, { type: [Number], default: [] })
    imageIds?: number[] = []

    @Validate(TypeValidate.BOOLEAN)
    available: boolean

    @Validate(TypeValidate.STRING)
    manufacturer: string

    @Validate(TypeValidate.NUMBER)
    cost: number

    @Validate(TypeValidate.NUMBER)
    horecaRequestItemId: number
}
