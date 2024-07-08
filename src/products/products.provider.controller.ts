import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common'
import { ApiOperation, ApiTags } from '@nestjs/swagger'
import { AuthUser } from '../utils/auth/decorators/auth.decorator'
import { UserRole } from '@prisma/client'
import { CreateProductProviderDto } from './dto/create-product.provider.dto'
import { ProductsProviderService } from './products.provider.service'
import { UpdateProductProviderDto } from './dto/update-product.provider.dto'
import { AuthInfoDto } from '../users/dto/auth.info.dto'
import { AuthParamDecorator } from '../utils/auth/decorators/auth.param.decorator'
import { DockGet } from '../utils/swagger/decorators/swagger.decorators'
import { ProductResponse } from './dto/product.response.dto'

@AuthUser(UserRole.Provider)
@Controller('products/provider')
@ApiTags('Products')
export class ProductsProviderController {
    constructor(private readonly service: ProductsProviderService) {}

    @Post()
    @ApiOperation({ summary: 'Create product from provider\'s offer' })
    async create(@AuthParamDecorator() auth: AuthInfoDto, @Body() dto: CreateProductProviderDto) {
        return this.service.create(auth, dto)
    }

    @Get()
    @DockGet([ProductResponse])
    @ApiOperation({ summary: 'Gat all products from provider\'s offer' })
    async findAll(@AuthParamDecorator() auth: AuthInfoDto) {
        return this.service.findAll(auth)
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get the specific product' })
    async get(@AuthParamDecorator() auth: AuthInfoDto, @Param('id') id: number) {
        return this.service.get(auth, id)
    }

    @Put(':id')
    @ApiOperation({ summary: 'Update the specific product' })
    async update(
        @AuthParamDecorator() auth: AuthInfoDto,
        @Param('id') id: number,
        @Body() dto: UpdateProductProviderDto
    ) {
        return this.service.update(auth, id, dto)
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete the specific product' })
    async delete(@AuthParamDecorator() auth: AuthInfoDto, @Param('id') id: number) {
        return this.service.delete(auth, id)
    }
}
