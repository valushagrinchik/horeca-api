import { ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'
import { UsersService } from '../users/users.service'

interface JwtPayload {
    id: number
    role: string
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
    constructor(
        readonly configService: ConfigService,
        readonly usersService: UsersService
    ) {
        const secret = configService.get<string>('JWT_ACCESS_TOKEN_SECRET')
        if (!secret) {
            throw new Error('JWT Secret is not defined in environment variables!')
        }

        super({
            jwtFromRequest: ExtractJwt.fromExtractors([
                request => {
                    const auth = request.headers?.authorization || request.handshake?.auth?.authorization || ''
                    return auth.startsWith('Bearer ') ? auth.replace('Bearer ', '') : null
                },
            ]),
            // .fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: secret,
        })
    }

    async validate(payload: JwtPayload) {
        const user = await this.usersService.getUserById(payload.id)
        if (!user) {
            throw new ForbiddenException()
        }
        return payload
    }
}
