import { Body, Controller, Delete, Get, Param, Post, Put } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { AuthUser } from "src/utils/auth/decorators/auth.decorator";
import { UserRole } from "@prisma/client";
import { CreateProductProviderDto } from "./dto/create-product.provider.dto";
import { ProductsProviderService } from "./products.provider.service";
import { UpdateProductProviderDto } from "./dto/update-product.provider.dto";
import { AuthInfoDto } from "src/users/dto/auth.info.dto";
import { AuthParamDecorator } from "src/utils/auth/decorators/auth.param.decorator";
import { DockGet } from "src/utils/swagger/decorators/swagger.decorators";
import { ProductResponse } from "./dto/product.response.dto";

@AuthUser(UserRole.Provider)
@Controller('products')
@ApiTags('Products')
export class ProductsProviderController {
    constructor(private readonly service: ProductsProviderService) {}

    @Post()
    async create(@AuthParamDecorator() auth: AuthInfoDto, @Body() dto: CreateProductProviderDto) {
        return this.service.create(auth, dto)
    }

    @Get()
    @DockGet([ProductResponse])
    async findAll(@AuthParamDecorator() auth: AuthInfoDto) {
        return this.service.findAll(auth)
    }

    @Get(':id')
    async get(@AuthParamDecorator() auth: AuthInfoDto, @Param('id') id: number,) {
        return this.service.get(auth, id)
    }

    @Put(':id')
    async update(@AuthParamDecorator() auth: AuthInfoDto, @Param('id') id: number, @Body() dto: UpdateProductProviderDto) {
        return this.service.update(auth, id, dto)
    }

    @Delete(':id')
    async delete(@AuthParamDecorator() auth: AuthInfoDto,  @Param('id') id: number) {
        return this.service.delete(auth, id)
    }
}