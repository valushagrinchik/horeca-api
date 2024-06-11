import { ApiProperty } from '@nestjs/swagger';
import { Product, ProductPackagingType } from '@prisma/client';
import { Expose } from 'class-transformer';

export class ProductResponse implements Product {
    @ApiProperty()
    id: number;
    @ApiProperty()
    profileId: number;
    @ApiProperty()
    category: string;
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
    @Expose()
    get isEditable(): boolean {
      return new Date().getTime() - new Date(this.createdAt).getTime() < 3 * 24 * 60 * 60 * 1000
    }
    
    constructor(partial: Product) {
      Object.assign(this, partial);
    }
}