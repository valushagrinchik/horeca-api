import { TypeValidate, Validate } from '@/shared/utils'

export class ProviderRequestItemCreateDto {
    @Validate(TypeValidate.ARRAY)
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
