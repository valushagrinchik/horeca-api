import { Controller, Body, Put, Get } from '@nestjs/common'
import { UsersService } from './services/users.service'
import { UpdateUserDto } from './dto/update-user.dto'
import { ApiExtraModels, ApiOperation, ApiTags } from '@nestjs/swagger'
import { HorecaProfileDto } from './dto/horeca/horeca-profile.dto'
import { ProviderProfileDto } from './dto/provider/provider-profile.dto'
import { UserDto } from './dto/user.dto'
import { AuthUser } from '../system/utils/auth/decorators/auth.decorator'
import { UserRole } from '@prisma/client'
import { AuthInfoDto } from './dto/auth.info.dto'
import { AuthParamDecorator } from '../system/utils/auth/decorators/auth.param.decorator'
import { RequestDecorator } from '../system/utils/swagger/decorators'

@Controller('users')
@ApiTags('Users')
@AuthUser(UserRole.Provider, UserRole.Horeca, UserRole.Admin)
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    @Put('me')
    @ApiOperation({ summary: 'Update users profile' })
    @RequestDecorator(UserDto, UpdateUserDto)
    async update(@AuthParamDecorator() auth: AuthInfoDto, @Body() dto: UpdateUserDto) {
        return this.usersService.update(auth, dto)
    }

    @Get('me')
    @ApiOperation({ summary: 'Get users profile' })
    @RequestDecorator(UserDto)
    @ApiExtraModels(HorecaProfileDto, ProviderProfileDto)
    async get(@AuthParamDecorator() auth: AuthInfoDto) {
        return this.usersService.get(auth)
    }
}
