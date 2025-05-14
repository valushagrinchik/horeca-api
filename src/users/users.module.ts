import { Logger, Module } from '@nestjs/common'
import { UsersService } from './users.service'
import { UsersController } from './users.controller'
import { MailService } from '../mail/mail.service'
import { MailModule } from '../mail/mail.module'
import { UsersDbService } from './users.db.service'
import { RequestsMatcherModule } from '@/shared/requestsMatcher/requestsMatcher.module'
import { UploadsModule } from '../uploads/uploads.module'
import { AuthorizationController } from './authorization.controller'
import { AuthorizationService } from './authorization.service'
import { JwtModule } from '@nestjs/jwt'
import { ConfigService } from '@nestjs/config'
import { UsersAdminController } from './users.admin.controller'

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
        RequestsMatcherModule,
        UploadsModule,
    ],
    controllers: [UsersController, AuthorizationController, UsersAdminController],
    providers: [UsersDbService, AuthorizationService, UsersService, MailService, Logger],
    exports: [UsersService, JwtModule],
})
export class UsersModule {}
