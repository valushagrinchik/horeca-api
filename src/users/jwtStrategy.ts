import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'
import { AuthInfoDto } from './dto/auth.info.dto'
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
    constructor(readonly configService: ConfigService) {
        super({
            jwtFromRequest: ExtractJwt.fromExtractors([
                request => {
                    const auth = request.headers?.authorization || request.handshake?.headers?.authorization || ''
                    return auth.replace('Bearer ', '')
                },
            ]),
            // .fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: configService.get('JWT_ACCESS_TOKEN_SECRET'),
        })
    }

    async validate(payload: any) {
        return { id: payload.id, role: payload.role } as AuthInfoDto
    }
}
