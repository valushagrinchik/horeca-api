import { Controller, Post, Body } from '@nestjs/common'
import { UsersService } from './users.service'
import { RegistrateUserDto } from './dto/registrate-user.dto'
import { ApiExtraModels, ApiTags } from '@nestjs/swagger'
import { LoginUserDto } from './dto/login-user.dto'
import { AuthResultDto } from './dto/auth.result.dto'
import { DockPost } from 'src/utils/swagger/decorators/swagger.decorators'
import { CreateHorecaProfileDto } from './dto/horeca/create-horeca-profile.dto'
import { CreateProviderProfileDto } from './dto/provider/create-provider-profile.dto'

@Controller('auth')
@ApiTags('Authorization')
export class AuthorizationController {
    constructor(private readonly usersService: UsersService) {}

    @Post('registration')
    @DockPost(RegistrateUserDto, AuthResultDto)
    @ApiExtraModels(CreateHorecaProfileDto, CreateProviderProfileDto)
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


