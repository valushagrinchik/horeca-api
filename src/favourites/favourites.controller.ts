import { Body, Controller, Delete, Param, Post } from '@nestjs/common'
import { ApiOperation, ApiTags } from '@nestjs/swagger'
import { AuthUser } from '../system/utils/auth/decorators/auth.decorator'
import { UserRole } from '@prisma/client'
import { AuthParamDecorator } from '../system/utils/auth/decorators/auth.param.decorator'
import { AuthInfoDto } from '../users/dto/auth.info.dto'
import { RequestDecorator } from '../system/utils/swagger/decorators'
import { FavouritesCreateDto } from './dto/favourites.create.dto'
import { SuccessDto } from '../system/utils/dto/success.dto'
import { FavouritesService } from './services/favourites.service'
import { FavouritesDto } from './dto/favourites.dto'

@AuthUser(UserRole.Horeca)
@Controller('horeca/favourites')
@ApiTags('Favourites')
export class FavouritesController {
    constructor(private readonly service: FavouritesService) {}

    @Post()
    @ApiOperation({ summary: 'Adds provider into favourites and creates chat' })
    @RequestDecorator(FavouritesDto, FavouritesCreateDto)
    async create(@AuthParamDecorator() auth: AuthInfoDto, @Body() dto: FavouritesCreateDto) {
        const fav = await this.service.create(auth, dto)
        return new FavouritesDto(fav)
    }

    @Delete(':providerId')
    @RequestDecorator(SuccessDto)
    @ApiOperation({ summary: 'Deletes provider from favourites' })
    async get(@AuthParamDecorator() auth: AuthInfoDto, @Param('providerId') providerId: number) {
        await this.service.delete(auth, +providerId)
        return new SuccessDto('ok')
    }
}
