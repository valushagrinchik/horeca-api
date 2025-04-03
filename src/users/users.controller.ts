import { Controller, Body, Put, Get } from '@nestjs/common'
import { UsersService } from './users.service'
import { UpdateUserDto } from './dto/update-user.dto'
import { ApiExtraModels, ApiOperation, ApiTags } from '@nestjs/swagger'
import { HorecaProfileDto } from './dto/horeca/horeca-profile.dto'
import { ProviderProfileDto } from './dto/provider/provider-profile.dto'
import { UserDto } from './dto/user.dto'
import { AuthUser, AuthParamDecorator } from '../auth/decorators'
import { UserRole } from '@prisma/client'
import { AuthInfoDto } from '../auth/dto/auth.info.dto'
import { RequestDecorator } from '../system/utils/swagger/decorators'

@Controller('users')
@ApiTags('Users')
@AuthUser(UserRole.Provider, UserRole.Horeca, UserRole.Admin)
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    @Put('me')
    @ApiOperation({ summary: 'Обновить профиль. Роль пользователя: Поставщик/Хорека/Админ' })
    @RequestDecorator(UserDto, UpdateUserDto)
    async update(@AuthParamDecorator() auth: AuthInfoDto, @Body() dto: UpdateUserDto) {
        return this.usersService.update(auth, dto)
    }

    @Get('me')
    @ApiOperation({ summary: 'Получить профиль. Роль пользователя: Поставщик/Хорека/Админ' })
    @RequestDecorator(UserDto)
    @ApiExtraModels(HorecaProfileDto, ProviderProfileDto)
    async get(@AuthParamDecorator() auth: AuthInfoDto) {
        return this.usersService.getProfile(auth)
    }
}
