import { ProductPackagingType } from '@prisma/client'
import { Categories } from '../../utils/enums'
import { TypeValidate, Validate } from '../../utils/validation/validate.decotators'

export class CreateProductProviderDto {
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

    @Validate(TypeValidate.STRING, { enum: ProductPackagingType, enumName: 'ProductPackagingType' })
    packagingType: ProductPackagingType

    @Validate(TypeValidate.ARRAY, { type: [Number] })
    imageIds: number[]
}
