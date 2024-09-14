import { Logger, Module } from '@nestjs/common'
import { UsersService } from './services/users.service'
import { UsersController } from './users.controller'
import { AuthorizationService } from './services/authorization.service'
import { JwtModule } from '@nestjs/jwt'
import { ConfigService } from '@nestjs/config'
import { JwtStrategy } from './jwtStrategy'
import { AuthorizationController } from './authorization.controller'
import { MailService } from '../mail/mail.service'
import { MailModule } from '../mail/mail.module'
import { UsersDbService } from './services/users.db.service'

@Module({
    imports: [
        JwtModule.registerAsync({
            useFactory: async (configService: ConfigService) => ({
                secret: configService.get('JWT_ACCESS_TOKEN_SECRET'),
                signOptions: { expiresIn: '5m' },
            }),
            inject: [ConfigService],
        }),
        MailModule,
    ],
    controllers: [UsersController, AuthorizationController],
    providers: [UsersDbService, UsersService, MailService, AuthorizationService, JwtStrategy, Logger],
    exports: [AuthorizationService, UsersService, JwtModule],
})
export class UsersModule {}
