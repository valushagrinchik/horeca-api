import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common'
import { ApiOperation, ApiTags } from '@nestjs/swagger'
import { AuthUser, AuthParamDecorator } from '../auth/decorators'
import { UserRole } from '@prisma/client'
import { AuthInfoDto } from '../auth/dto/auth.info.dto'
import {
    PaginateValidateType,
    RequestDecorator,
    RequestPaginatedDecorator,
    RequestPaginatedValidateParamsDecorator,
    SuccessDto,
    PaginatedDto,
} from '@/shared/utils'
import { FavouritesCreateDto } from './dto/favourites.create.dto'
import { FavouritesService } from './services/favourites.service'
import { FavouritesDto } from './dto/favourites.dto'

@AuthUser(UserRole.Horeca)
@Controller('horeca/favourites')
@ApiTags('Favourites')
export class FavouritesController {
    constructor(private readonly service: FavouritesService) {}

    @Post()
    @ApiOperation({ summary: 'Добавить поставщика в избранное. Роль пользователя: Хорека' })
    @RequestDecorator(FavouritesDto, FavouritesCreateDto)
    async create(@AuthParamDecorator() auth: AuthInfoDto, @Body() dto: FavouritesCreateDto) {
        const fav = await this.service.create(auth, dto)
        return new FavouritesDto(fav)
    }

    @Delete(':providerId')
    @RequestDecorator(SuccessDto)
    @ApiOperation({ summary: 'Удалить поставщика из избранного. Роль пользователя: Хорека' })
    async delete(@AuthParamDecorator() auth: AuthInfoDto, @Param('providerId') providerId: number) {
        await this.service.delete(auth, +providerId)
        return new SuccessDto('ok')
    }

    @AuthUser(UserRole.Horeca, UserRole.Provider)
    @Get()
    @RequestPaginatedDecorator(FavouritesDto)
    @ApiOperation({ summary: 'Получить список избранных. Роль пользователя: Поставщик/Хорека' })
    async findAll(
        @AuthParamDecorator() auth: AuthInfoDto,
        @RequestPaginatedValidateParamsDecorator() paginate: PaginateValidateType<Object>
    ) {
        const [data, total] = await this.service.findAllAndCount(auth, paginate)
        return new PaginatedDto(data, total)
    }
}
