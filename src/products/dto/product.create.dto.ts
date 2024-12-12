import { ProductPackagingType } from '@prisma/client'
import { Categories } from '../../system/utils/enums'
import { ApiProperty } from '@nestjs/swagger'

export class ProductCreateDto {
    @ApiProperty({ enum: Categories, enumName: 'Categories' })
    category: Categories

    name: string

    description: string

    producer: string

    cost: number

    count: number

    @ApiProperty({ enum: ProductPackagingType, enumName: 'ProductPackagingType' })
    packagingType: ProductPackagingType

    imageIds: number[]
}
