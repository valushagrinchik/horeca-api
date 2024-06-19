import { Controller, Body, Put, Get, Param } from '@nestjs/common'
import { UsersService } from './users.service'
import { UpdateUserDto } from './dto/update-user.dto'
import { ApiExtraModels, ApiTags } from '@nestjs/swagger'
import { HorecaProfileDto } from './dto/horeca/horeca-profile.dto'
import { ProviderProfileDto } from './dto/provider/provider-profile.dto'
import { DockGet, DockPost } from 'src/utils/swagger/decorators/swagger.decorators'
import { UserDto } from './dto/user.dto'
import { AuthUser } from 'src/utils/auth/decorators/auth.decorator'
import { ProfileType, UserRole } from '@prisma/client'
import { AuthInfoDto } from './dto/auth.info.dto'
import { AuthParamDecorator } from 'src/utils/auth/decorators/auth.param.decorator'

@Controller('users')
@ApiTags('Users')
@AuthUser(UserRole.Provider, UserRole.Horeca)
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    @Put('me')
    @DockPost(UpdateUserDto, UserDto)
    async update( @AuthParamDecorator() auth: AuthInfoDto, @Body() dto: UpdateUserDto) {
        return this.usersService.update(auth, auth.id, dto)
    }

    @Get('me')
    @DockGet(UserDto)
    @ApiExtraModels(HorecaProfileDto, ProviderProfileDto)
    async get( @AuthParamDecorator() auth: AuthInfoDto ) {
        return this.usersService.get(auth, auth.id)
    }
}


