import { Controller, Post, Body, Get, Param, Res } from '@nestjs/common'
import { UsersService } from './users.service'
import { RegistrateUserDto } from './dto/registrate-user.dto'
import { ApiExtraModels, ApiOperation, ApiTags } from '@nestjs/swagger'
import { LoginUserDto } from './dto/login-user.dto'
import { AuthResultDto } from './dto/auth.result.dto'
import { CreateHorecaProfileDto } from './dto/horeca/create-horeca-profile.dto'
import { CreateProviderProfileDto } from './dto/provider/create-provider-profile.dto'
import { SuccessDto } from '../utils/success.dto'
import { Response } from 'express'
import { ConfigService } from '@nestjs/config'
import { RequestDecorator } from 'src/utils/swagger/decorators'

@Controller('auth')
@ApiTags('Authorization')
export class AuthorizationController {
    constructor(
        private readonly configService: ConfigService,
        private readonly usersService: UsersService
    ) {}

    @Post('registration')
    @ApiOperation({ summary: 'Registrate user' })
    @RequestDecorator(AuthResultDto, RegistrateUserDto)
    @ApiExtraModels(CreateHorecaProfileDto, CreateProviderProfileDto)
    async registrate(@Body() dto: RegistrateUserDto) {
        return this.usersService.registrate(dto)
    }

    @Post('login')
    @ApiOperation({ summary: 'Authenticate user' })
    @RequestDecorator(AuthResultDto, LoginUserDto)
    async login(@Body() loginDto: LoginUserDto) {
        return this.usersService.login(loginDto)
    }

    @Get('activate/:uuid')
    @ApiOperation({ summary: 'Activate profile by link in the confirmation email' })
    @RequestDecorator(SuccessDto)
    async activateAccount(@Res() res: Response, @Param('uuid') uuid: string) {
        await this.usersService.activateAccount(uuid)
        res.redirect(this.configService.get('FRONTEND_URL'))
    }

    // @Get('password-recovery')
    // @RequestDecorator(SuccessDto)
    // async passwordRecovery(@Query('email') email: string) {
    //     await this.usersService.passwordRecovery(email)
    //     return new SuccessDto('ok')
    // }

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
