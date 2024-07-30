import { ApiProperty } from '@nestjs/swagger'
import { Product, ProductPackagingType, Uploads } from '@prisma/client'
import { Expose } from 'class-transformer'
import { Categories } from '../../utils/constants'

export class Image implements Uploads {
    @ApiProperty()
    id: number
    @ApiProperty()
    name: string
    @ApiProperty()
    mimetype: string
    @ApiProperty()
    path: string
    @ApiProperty()
    size: number
    @ApiProperty()
    createdAt: Date
    @ApiProperty()
    updatedAt: Date
}
export class ProductImage {
    @ApiProperty({type: Image})
    image: Image
}

export class ProductResponse implements Product {
    @ApiProperty()
    id: number
    @ApiProperty()
    profileId: number
    @ApiProperty()
    category: Categories
    @ApiProperty()
    name: string
    @ApiProperty()
    description: string
    @ApiProperty()
    producer: string
    @ApiProperty()
    cost: number
    @ApiProperty()
    count: number
    @ApiProperty()
    packagingType: ProductPackagingType
    @ApiProperty()
    createdAt: Date
    @ApiProperty()
    updatedAt: Date
    @ApiProperty({ type: [ProductImage] })
    productImage: ProductImage[]

    @ApiProperty()
    @Expose()
    get isEditable(): boolean {
        return new Date().getTime() - new Date(this.createdAt).getTime() < 3 * 24 * 60 * 60 * 1000
    }

    constructor(partial: Product) {
        Object.assign(this, partial)
    }
}
