import { ApiProperty } from '@nestjs/swagger';
import { Product, ProductPackagingType, Uploads } from '@prisma/client';
import { Expose } from 'class-transformer';
import { Categories } from 'src/utils/constants';

export class ProductResponse implements Product {
    @ApiProperty()
    id: number;
    @ApiProperty()
    profileId: number;
    @ApiProperty()
    category: Categories;
    @ApiProperty()
    name: string;
    @ApiProperty()
    description: string;
    @ApiProperty()
    producer: string;
    @ApiProperty()
    cost: number;
    @ApiProperty()
    count: number;
    @ApiProperty()
    packagingType: ProductPackagingType;
    @ApiProperty()
    createdAt: Date;
    @ApiProperty()
    updatedAt: Date;

    @ApiProperty()
    productImage: {
        image: Uploads
    }[]
   
    @ApiProperty()
    @Expose()
    get isEditable(): boolean {
      return new Date().getTime() - new Date(this.createdAt).getTime() < 3 * 24 * 60 * 60 * 1000
    }
    
    constructor(partial: Product) {
      Object.assign(this, partial);
    }
}