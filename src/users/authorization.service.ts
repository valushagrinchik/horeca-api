import { Injectable, UnauthorizedException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { JwtService } from '@nestjs/jwt'

import { AuthInfoDto } from './dto/auth.info.dto'
// import { RefreshDto } from './dto/refresh.dto'
import { User } from '@prisma/client'
// import { ErrorDto } from '../../helpers/dto/error.dto'
// import { ErrorCodeEnum } from '../../helpers/enum/error.code.enum'

@Injectable()
export class AuthorizationService {
    constructor(
        private jwtService: JwtService,
        private configService: ConfigService
    ) {}

    async login(user: User) {
        const payload = { id: user.id } as AuthInfoDto
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

    /**
     * Get token for password recovery
     * @param user
     * @returns
     */
    getRecoveryToken(user: AuthInfoDto) {
        const payload = { id: user.id }
        const token = this.jwtService.sign(payload, {
            secret: this.configService.get('JWT_ACCESS_TOKEN_SECRET'),
            expiresIn: '15m',
        })

        return token
    }

    /**
     * Verify token
     * @param token
     * @returns
     */
    verifyRecoveryToken(token: string) {
        return this.jwtService.verify(token, {
            secret: this.configService.get('JWT_ACCESS_TOKEN_SECRET'),
        })
    }
}
