import { Categories, TypeValidate, Validate } from '@/shared/utils'

export class ProductCreateDto {
    @Validate(TypeValidate.STRING, { enum: Categories, enumName: 'Categories' })
    category: Categories
    @Validate(TypeValidate.STRING)
    name: string
    @Validate(TypeValidate.STRING)
    description: string
    @Validate(TypeValidate.STRING)
    producer: string
    @Validate(TypeValidate.NUMBER)
    cost: number
    @Validate(TypeValidate.STRING)
    count: string
    @Validate(TypeValidate.STRING)
    packagingType: string
    @Validate(TypeValidate.ARRAY)
    imageIds: number[]
}
