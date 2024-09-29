import { Body, Controller, Delete, Param, Post } from '@nestjs/common'
import { ApiOperation, ApiTags } from '@nestjs/swagger'
import { AuthUser } from '../system/utils/auth/decorators/auth.decorator'
import { UserRole } from '@prisma/client'
import { AuthParamDecorator } from '../system/utils/auth/decorators/auth.param.decorator'
import { AuthInfoDto } from '../users/dto/auth.info.dto'
import { RequestDecorator } from '../system/utils/swagger/decorators'
import { FavouriteCreateDto } from './dto/favourite.create.dto'
import { SuccessDto } from '../system/utils/dto/success.dto'
import { FavouritesService } from './services/favourites.service'
import { FavouriteCreateResponseDto } from './dto/favourite.create.response.dto'

@AuthUser(UserRole.Horeca)
@Controller('horeca/favourites')
@ApiTags('Favourites')
export class FavouritesController {
    constructor(private readonly service: FavouritesService) {}

    @Post()
    @ApiOperation({ summary: 'Adds provider into favourites and creates chat' })
    @RequestDecorator(FavouriteCreateResponseDto, FavouriteCreateDto)
    async create(@AuthParamDecorator() auth: AuthInfoDto, @Body() dto: FavouriteCreateDto) {
        const res = await this.service.create(auth, dto)
        return new FavouriteCreateResponseDto(res)
    }

    @Delete(':providerId')
    @RequestDecorator(SuccessDto)
    @ApiOperation({ summary: 'Deletes provider from favourites' })
    async get(@AuthParamDecorator() auth: AuthInfoDto, @Param('providerId') providerId: number) {
        await this.service.delete(auth, +providerId)
        return new SuccessDto('ok')
    }
}
