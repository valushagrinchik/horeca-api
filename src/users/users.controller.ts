import { Controller, Post, Body } from '@nestjs/common'
import { UsersService } from './users.service'
import { RegistrateUserDto } from './dto/registrate-user.dto'
import { ApiExtraModels, ApiTags } from '@nestjs/swagger'
import { HorecaProfileDto } from './dto/horeca-profile.dto'
import { ProviderProfileDto } from './dto/provider-profile.dto'
import { LoginUserDto } from './dto/login-user.dto'
import { AuthResultDto } from './dto/auth.result.dto'
import { DockPost } from 'src/utils/swagger/decorators/swagger.decorators'

@Controller('users')
@ApiTags('User')
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    @Post()
    @DockPost(RegistrateUserDto, AuthResultDto)
    @ApiExtraModels(HorecaProfileDto, ProviderProfileDto)
    async registrate(@Body() dto: RegistrateUserDto) {
        return this.usersService.registrate(dto)
    }

    @Post('login')
    async login(@Body() loginDto: LoginUserDto) {
        return this.usersService.login(loginDto)
    }

    // @Get('password-recovery')
    // @DockGet(SuccessDto)
    // async passwordRecovery(@Query('email') email: string) {
    //     await this.usersService.passwordRecovery(email)
    //     return new SuccessDto('ok')
    // }

    // @Put('recover-password')
    // @DockGet(SuccessDto)
    // async recoverPassword(@Body() dto: RecoverPasswordDto) {
    //     await this.usersService.recoverPassword(dto)
    //     return new SuccessDto('ok')
    // }

    // @Put('change-password')
    // @DockPost(ChangePasswordDto)
    // @AuthUser(UserRoles.USER)
    // async changePassword(@AuthDecorator() auth: AuthInfoDto, @Body() dto: ChangePasswordDto) {
    //     return await this.usersService.changePassword(auth, dto)
    // }
}


