import { Controller, Body, Put, Get } from '@nestjs/common'
import { UsersService } from './users.service'
import { UpdateUserDto } from './dto/update-user.dto'
import { ApiExtraModels, ApiOperation, ApiTags } from '@nestjs/swagger'
import { HorecaProfileDto } from './dto/horeca/horeca-profile.dto'
import { ProviderProfileDto } from './dto/provider/provider-profile.dto'
import { DockGet, DockPost } from '../utils/swagger/decorators/swagger.decorators'
import { UserDto } from './dto/user.dto'
import { AuthUser } from '../utils/auth/decorators/auth.decorator'
import { UserRole } from '@prisma/client'
import { AuthInfoDto } from './dto/auth.info.dto'
import { AuthParamDecorator } from '../utils/auth/decorators/auth.param.decorator'

@Controller('users')
@ApiTags('Users')
@AuthUser(UserRole.Provider, UserRole.Horeca)
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    @Put('me')
    @ApiOperation({ summary: 'Update users profile' })
    @DockPost(UpdateUserDto, UserDto)
    async update(@AuthParamDecorator() auth: AuthInfoDto, @Body() dto: UpdateUserDto) {
        return this.usersService.update(auth, dto)
    }

    @Get('me')
    @ApiOperation({ summary: 'Get users profile' })
    @DockGet(UserDto)
    @ApiExtraModels(HorecaProfileDto, ProviderProfileDto)
    async get(@AuthParamDecorator() auth: AuthInfoDto) {
        return this.usersService.get(auth)
    }
}
