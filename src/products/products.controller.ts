import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common'
import { ApiOperation, ApiTags } from '@nestjs/swagger'
import { AuthUser } from '../system/utils/auth/decorators/auth.decorator'
import { UserRole } from '@prisma/client'
import { ProductsService } from './products.service'
import { AuthInfoDto } from '../users/dto/auth.info.dto'
import { AuthParamDecorator } from '../system/utils/auth/decorators/auth.param.decorator'
import { ProductDto } from './dto/product.dto'
import {
    PaginateValidateType,
    RequestDecorator,
    RequestPaginatedDecorator,
    RequestPaginatedValidateParamsDecorator,
} from '../system/utils/swagger/decorators'
import { ProductSearchDto } from './dto/product.search.dto'
import { ProductUpdateDto } from './dto/product.update.dto'
import { ProductCreateDto } from './dto/product.create.dto'

@AuthUser(UserRole.Provider)
@Controller('products/provider')
@ApiTags('Products')
export class ProductsController {
    constructor(private readonly service: ProductsService) {}

    @Post()
    @RequestDecorator(ProductDto, ProductCreateDto)
    @ApiOperation({ summary: "Create product from provider's offer" })
    async create(@AuthParamDecorator() auth: AuthInfoDto, @Body() dto: ProductCreateDto) {
        return this.service.create(auth, dto)
    }

    @RequestPaginatedDecorator(ProductDto, ProductSearchDto)
    @ApiOperation({ summary: "Gat all products from provider's offer" })
    async findAll(
        @AuthParamDecorator() auth: AuthInfoDto,
        @RequestPaginatedValidateParamsDecorator() paginate: PaginateValidateType<ProductSearchDto>
    ) {
        return this.service.findAll(auth, paginate)
    }

    @Get(':id')
    @RequestDecorator(ProductDto)
    @ApiOperation({ summary: 'Get the specific product' })
    async get(@AuthParamDecorator() auth: AuthInfoDto, @Param('id') id: number) {
        return this.service.get(auth, id)
    }

    @Put(':id')
    @RequestDecorator(ProductDto, ProductUpdateDto)
    @ApiOperation({ summary: 'Update the specific product' })
    async update(@AuthParamDecorator() auth: AuthInfoDto, @Param('id') id: number, @Body() dto: ProductUpdateDto) {
        return this.service.update(auth, id, dto)
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete the specific product' })
    async delete(@AuthParamDecorator() auth: AuthInfoDto, @Param('id') id: number) {
        return this.service.delete(auth, id)
    }
}
