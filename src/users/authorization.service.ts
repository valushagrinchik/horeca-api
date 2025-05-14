import { BadRequestException, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { JwtService } from '@nestjs/jwt'
import { ErrorDto, ErrorCodes, validPassword } from '@/shared/utils'
import { RegistrateUserDto } from './dto/registrate-user.dto'
import { UsersService } from '../users/users.service'
import { MailService } from '../mail/mail.service'
import { AuthInfoDto } from '../auth/dto/auth.info.dto'
import { LoginUserDto } from './dto/login-user.dto'

import { ChangePasswordDto } from './dto/change-password.dto'

@Injectable()
export class AuthorizationService {
    constructor(
        private jwtService: JwtService,
        private configService: ConfigService,
        private userService: UsersService,
        private mailService?: MailService
    ) {}

    async registrate(dto: RegistrateUserDto) {
        if (!dto.GDPRApproved) {
            throw new BadRequestException(new ErrorDto(ErrorCodes.GDPR_IS_NOT_APPROVED))
        }
        const user = await this.userService.create(dto)

        await this.mailService?.sendActivationMail({
            userId: user.id,
            username: user.name,
            email: user.email,
            link: user.activationLink,
        })

        return user
    }

    async activateAccount(uuid: string) {
        await this.userService.activate(uuid)
    }

    async passwordRecovery(email: string) {
        const user = await this.userService.getUserByEmail(email)
        if (!user) {
            throw new BadRequestException(new ErrorDto(ErrorCodes.USER_DOES_NOT_EXISTS))
        }
        await this.mailService?.sendRecoveryPass({
            userId: user.id,
            email: user.email,
            link: user.activationLink,
        })
    }

    async passwordChange(uuid: string, dto: ChangePasswordDto) {
        const user = await this.userService.passwordChange(uuid, dto)

        await this.mailService?.sendPassChanged({
            userId: user.id,
            email: user.email,
        })
    }

    async login(dto: LoginUserDto) {
        const user = await this.userService.getUserByEmail(dto.email)

        if (!user?.isActivated) {
            throw new BadRequestException(new ErrorDto(ErrorCodes.AUTH_FAIL, ['user_is_not_activated']))
        }

        if (!validPassword(dto.password, user.password)) {
            throw new BadRequestException(new ErrorDto(ErrorCodes.AUTH_FAIL, ['incorrect_username_or_password']))
        }

        const payload = { id: user.id, role: user.role } as AuthInfoDto
        const token = {
            accessToken: this.jwtService.sign(payload, {
                secret: this.configService.get('JWT_ACCESS_TOKEN_SECRET'),
                expiresIn: '365d',
            }),
            refreshToken: this.jwtService.sign(payload, {
                secret: this.configService.get('JWT_REFRESH_TOKEN_SECRET'),
                expiresIn: '365d',
            }),
        }

        return token
    }

    // async getNewAccessToken(dto: RefreshDto) {
    //     try {
    //         const payload = this.jwtService.verify(dto.refresh_token, {
    //             secret: this.configService.get('JWT_REFRESH_TOKEN_SECRET'),
    //         })
    //         const session = await this.usersDatabaseService.findToken(
    //             dto.refresh_token,
    //             payload.id,
    //             payload.databaseName
    //         )
    //         if (!session) {
    //             throw new Error('ACCESS_CREATE_FAIL')
    //         }

    //         return {
    //             accessToken: this.jwtService.sign(
    //                 {
    //                     id: payload.id,
    //                     databaseName: payload.databaseName,
    //                 },
    //                 {
    //                     secret: this.configService.get('JWT_ACCESS_TOKEN_SECRET'),
    //                     expiresIn: '365d',
    //                 }
    //             ),
    //         }
    //     } catch (e) {
    //         throw new UnauthorizedException(new ErrorDto(ErrorCodeEnum.ACCESS_CREATE_FAIL))
    //     }
    // }
}
