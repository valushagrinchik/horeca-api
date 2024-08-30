import { ProductPackagingType } from '@prisma/client'
import { Categories } from '../../system/utils/enums'

export class ProductCreateDto {
    category: Categories

    name: string

    description: string

    producer: string

    cost: number

    count: number

    packagingType: ProductPackagingType

    imageIds: number[]
}
