import { Categories, TypeValidate, Validate } from '@/shared/utils'

export class HorecaRequestItemCreateDto {
    @Validate(TypeValidate.STRING)
    name: string

    @Validate(TypeValidate.NUMBER)
    amount: number

    @Validate(TypeValidate.STRING)
    unit: string

    @Validate(TypeValidate.STRING, { enum: Categories, enumName: 'Categories' })
    category: Categories
}
