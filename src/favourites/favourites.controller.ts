import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common'
import { ApiOperation, ApiTags } from '@nestjs/swagger'
import { AuthUser } from '../system/utils/auth/decorators/auth.decorator'
import { UserRole } from '@prisma/client'
import { AuthParamDecorator } from '../system/utils/auth/decorators/auth.param.decorator'
import { AuthInfoDto } from '../users/dto/auth.info.dto'
import {
    PaginateValidateType,
    RequestDecorator,
    RequestPaginatedDecorator,
    RequestPaginatedValidateParamsDecorator,
} from '../system/utils/swagger/decorators'
import { FavouritesCreateDto } from './dto/favourites.create.dto'
import { SuccessDto } from '../system/utils/dto/success.dto'
import { FavouritesService } from './services/favourites.service'
import { PaginatedDto } from '../system/utils/dto/paginated.dto'
import { FavouritesDto } from './dto/favourites.dto'

@AuthUser(UserRole.Horeca)
@Controller('horeca/favourites')
@ApiTags('Favourites')
export class FavouritesController {
    constructor(private readonly service: FavouritesService) {}

    @Post()
    @ApiOperation({ summary: 'Add provider in favourites to be able to chat' })
    @RequestDecorator(FavouritesDto, FavouritesCreateDto)
    async create(@AuthParamDecorator() auth: AuthInfoDto, @Body() dto: FavouritesCreateDto) {
        const fav = await this.service.create(auth, dto)
        return new FavouritesDto(fav)
    }

    @Delete(':providerId')
    @RequestDecorator(SuccessDto)
    @ApiOperation({ summary: 'Delete provider from favourites' })
    async delete(@AuthParamDecorator() auth: AuthInfoDto, @Param('providerId') providerId: number) {
        await this.service.delete(auth, +providerId)
        return new SuccessDto('ok')
    }

    @AuthUser(UserRole.Horeca, UserRole.Provider)
    @Get()
    @RequestPaginatedDecorator(FavouritesDto)
    @ApiOperation({ summary: 'Get all favourite providers/horecas' })
    async findAll(
        @AuthParamDecorator() auth: AuthInfoDto,
        @RequestPaginatedValidateParamsDecorator() paginate: PaginateValidateType
    ) {
        const [data, total] = await this.service.findAllAndCount(auth, paginate)
        return new PaginatedDto(data, total)
    }
}
