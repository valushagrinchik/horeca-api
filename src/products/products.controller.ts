import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common'
import { ApiOperation, ApiTags } from '@nestjs/swagger'
import { AuthUser, AuthParamDecorator } from '../auth/decorators'
import { UserRole } from '@prisma/client'
import { ProductsService } from './products.service'
import { AuthInfoDto } from '../auth/dto/auth.info.dto'
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
import { PaginatedDto } from '../system/utils/dto/paginated.dto'

@AuthUser(UserRole.Provider)
@Controller('products/provider')
@ApiTags('Products')
export class ProductsController {
    constructor(private readonly service: ProductsService) {}

    @Post()
    @RequestDecorator(ProductDto, ProductCreateDto)
    @ApiOperation({ summary: 'Создать продукт. Роль пользователя: Поставщик' })
    async create(@AuthParamDecorator() auth: AuthInfoDto, @Body() dto: ProductCreateDto) {
        return this.service.create(auth, dto)
    }

    @Get()
    @RequestPaginatedDecorator(ProductDto, ProductSearchDto)
    @ApiOperation({ summary: 'Получить все продукты. Роль пользователя: Поставщик' })
    async findAll(
        @AuthParamDecorator() auth: AuthInfoDto,
        @RequestPaginatedValidateParamsDecorator<ProductSearchDto>({ search: ProductSearchDto })
        paginate: PaginateValidateType<ProductSearchDto>
    ) {
        const [data, total] = await this.service.findAllAndCount(auth, paginate)
        return new PaginatedDto<ProductDto>(data, total)
    }

    @Get(':id')
    @RequestDecorator(ProductDto)
    @ApiOperation({ summary: 'Получить продукт по id. Роль пользователя: Поставщик' })
    async get(@AuthParamDecorator() auth: AuthInfoDto, @Param('id') id: number) {
        return this.service.get(auth, id)
    }

    @Put(':id')
    @RequestDecorator(ProductDto, ProductUpdateDto)
    @ApiOperation({ summary: 'Обновить продукт. Роль пользователя: Поставщик' })
    async update(@AuthParamDecorator() auth: AuthInfoDto, @Param('id') id: number, @Body() dto: ProductUpdateDto) {
        return this.service.update(auth, id, dto)
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Удалить продукт. Роль пользователя: Поставщик' })
    async delete(@AuthParamDecorator() auth: AuthInfoDto, @Param('id') id: number) {
        return this.service.delete(auth, id)
    }
}
