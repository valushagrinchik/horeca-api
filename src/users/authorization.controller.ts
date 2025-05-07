import { Controller, Post, Body, Get, Param, Query } from '@nestjs/common'
import { RegistrateUserDto } from './dto/registrate-user.dto'
import { ApiExtraModels, ApiOperation, ApiTags } from '@nestjs/swagger'
import { LoginUserDto } from './dto/login-user.dto'
import { AuthResultDto } from '../auth/dto/auth.result.dto'
import { CreateHorecaProfileDto } from '../users/dto/horeca/create-horeca-profile.dto'
import { CreateProviderProfileDto } from '../users/dto/provider/create-provider-profile.dto'
import { SuccessDto } from '../system/utils/dto/success.dto'
import { ConfigService } from '@nestjs/config'
import { RequestDecorator } from '../system/utils/swagger/decorators'
import { UserDto } from '../users/dto/user.dto'
import { AuthorizationService } from './authorization.service'
import { ChangePasswordDto } from './dto/change-password.dto'

@Controller('auth')
@ApiTags('Authorization')
export class AuthorizationController {
    constructor(
        private readonly configService: ConfigService,
        private readonly authService: AuthorizationService
    ) {}

    @Post('registration')
    @ApiOperation({ summary: 'Регистрация пользователя' })
    @RequestDecorator(UserDto, RegistrateUserDto)
    @ApiExtraModels(CreateHorecaProfileDto, CreateProviderProfileDto)
    async registrate(@Body() dto: RegistrateUserDto) {
        return this.authService.registrate(dto)
    }

    @Post('login')
    @ApiOperation({ summary: 'Авторизация пользователя' })
    @RequestDecorator(AuthResultDto, LoginUserDto)
    async login(@Body() loginDto: LoginUserDto) {
        return this.authService.login(loginDto)
    }

    @Get('activate/:uuid')
    @ApiOperation({ summary: 'Ссылка для активации пользователя ( отправляется в письме при регистрации)' })
    @RequestDecorator(SuccessDto)
    async activateAccount(@Param('uuid') uuid: string) {
        await this.authService.activateAccount(uuid)
        return new SuccessDto('ok')
    }

    @Get('password/recovery')
    @RequestDecorator(SuccessDto)
    async passwordRecovery(@Query('email') email: string) {
        console.log(email, 'email')
        await this.authService.passwordRecovery(email)
        return new SuccessDto('ok')
    }

    @Post('password/change/:uuid')
    @RequestDecorator(SuccessDto)
    async passwordChange(@Param('uuid') uuid: string, @Body() dto: ChangePasswordDto) {
        await this.authService.passwordChange(uuid, dto)
        return new SuccessDto('ok')
    }

    // @Put('recover-password')
    // @RequestDecorator(SuccessDto)
    // async recoverPassword(@Body() dto: RecoverPasswordDto) {
    //     await this.usersService.recoverPassword(dto)
    //     return new SuccessDto('ok')
    // }

    // @Put('change-password')
    // @RequestDecorator(null, ChangePasswordDto)
    // @AuthUser(UserRoles.USER)
    // async changePassword(@AuthDecorator() auth: AuthInfoDto, @Body() dto: ChangePasswordDto) {
    //     return await this.usersService.changePassword(auth, dto)
    // }
}
