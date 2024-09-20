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

@AuthUser(UserRole.Horeca)
@Controller('horeca/favourites')
@ApiTags('Favourites')
export class FavouritesController {
    constructor(private readonly service: FavouritesService) {}

    @Post()
    @ApiOperation({ summary: 'Add provider in favourites to be able to chat' })
    @RequestDecorator(SuccessDto, FavouritesCreateDto)
    async create(@AuthParamDecorator() auth: AuthInfoDto, @Body() dto: FavouritesCreateDto) {
        await this.service.create(auth, dto)
        return new SuccessDto('ok')
    }

    @Delete(':providerId')
    @RequestDecorator(SuccessDto)
    @ApiOperation({ summary: 'Delete provider from favourites' })
    async get(@AuthParamDecorator() auth: AuthInfoDto, @Param('providerId') providerId: number) {
        await this.service.delete(auth, +providerId)
        return new SuccessDto('ok')
    }
}
