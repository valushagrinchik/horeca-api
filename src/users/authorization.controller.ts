import { Controller, Post, Body, Get, Param, Res } from '@nestjs/common'
import { UsersService } from './users.service'
import { RegistrateUserDto } from './dto/registrate-user.dto'
import { ApiExtraModels, ApiTags } from '@nestjs/swagger'
import { LoginUserDto } from './dto/login-user.dto'
import { AuthResultDto } from './dto/auth.result.dto'
import { DockGet, DockPost } from 'src/utils/swagger/decorators/swagger.decorators'
import { CreateHorecaProfileDto } from './dto/horeca/create-horeca-profile.dto'
import { CreateProviderProfileDto } from './dto/provider/create-provider-profile.dto'
import { SuccessDto } from 'src/utils/success.dto'
import { Response } from 'express'
import { ConfigService } from '@nestjs/config'

@Controller('auth')
@ApiTags('Authorization')
export class AuthorizationController {
    constructor(
        private readonly configService: ConfigService,
        private readonly usersService: UsersService
    ) {}

    @Post('registration')
    @DockPost(RegistrateUserDto, AuthResultDto)
    @ApiExtraModels(CreateHorecaProfileDto, CreateProviderProfileDto)
    async registrate(@Body() dto: RegistrateUserDto) {
        return this.usersService.registrate(dto)
    }

    @Post('login')
    @DockPost(LoginUserDto, AuthResultDto)
    async login(@Body() loginDto: LoginUserDto) {
        return this.usersService.login(loginDto)
    }

    @Get('activate/:uuid')
    @DockGet(SuccessDto)
    async activateAccount(@Res() res: Response, @Param('uuid') uuid: string) {
        await this.usersService.activateAccount(uuid)
        res.redirect(this.configService.get('FRONTEND_URL'))
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
