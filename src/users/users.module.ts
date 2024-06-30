import { Logger, Module } from '@nestjs/common'
import { UsersService } from './users.service'
import { UsersController } from './users.controller'
import { PrismaService } from '../prisma.service'
import { AuthorizationService } from './authorization.service'
import { JwtModule } from '@nestjs/jwt'
import { ConfigService } from '@nestjs/config'
import { JwtStrategy } from './jwtStrategy'
import { AuthorizationController } from './authorization.controller'
import { MailService } from '../mail/mail.service'
import { MailModule } from '../mail/mail.module'

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
    providers: [UsersService, PrismaService, MailService, AuthorizationService, JwtStrategy, Logger],
    exports: [AuthorizationService, UsersService],
})
export class UsersModule {}
