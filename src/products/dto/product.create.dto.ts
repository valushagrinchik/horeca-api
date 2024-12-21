import { Categories } from '../../system/utils/enums'
import { TypeValidate, Validate } from '../../system/utils/validation/validate.decotators'

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
    @Validate(TypeValidate.NUMBER)
    count: number
    @Validate(TypeValidate.STRING)
    packagingType: string
    @Validate(TypeValidate.ARRAY)
    imageIds: number[]
}
