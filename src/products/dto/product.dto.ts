import { ApiProperty } from '@nestjs/swagger'
import { Product, ProductPackagingType } from '@prisma/client'
import { Categories } from '../../system/utils/enums'
import { SourceWithUploads } from '../../uploads/dto/upload.dto'

export class ProductDto extends SourceWithUploads implements Product {
    id: number
    userId: number
    category: Categories
    name: string
    description: string
    producer: string
    cost: number
    count: number
    @ApiProperty({ enum: ProductPackagingType, enumName: 'ProductPackagingType' })
    packagingType: ProductPackagingType
    createdAt: Date
    updatedAt: Date

    @ApiProperty()
    get isEditable(): boolean {
        return new Date().getTime() - new Date(this.createdAt).getTime() < 3 * 24 * 60 * 60 * 1000
    }

    constructor(product: Partial<Product & SourceWithUploads>) {
        super()
        Object.assign(this, product)
    }
}
