import { Logger, Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { MailerModule } from '@nestjs-modules/mailer'
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter'

import { MailCronService } from './mail.cron.service'
import { MailService } from './mail.service'
import { CronModule } from '../system/cron/cron.module'

@Module({
    imports: [
        MailerModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => ({
                transport: {
                    host: configService.get(`SMTP_HOST`),
                    port: configService.get(`SMTP_PORT`),
                    secure: configService.get(`SMTP_SSL`),
                    auth: {
                        user: configService.get(`SMTP_USER`),
                        pass: configService.get(`SMTP_PASSWORD`),
                    },
                    tls: { rejectUnauthorized: false },
                },
                defaults: {
                    from: '"nest-modules" <modules@nestjs.com>',
                },
                template: {
                    dir: __dirname + '/templates',
                    adapter: new HandlebarsAdapter(),
                    options: {
                        strict: true,
                    },
                },
            }),
        }),
        CronModule,
    ],
    providers: [MailService, MailCronService, Logger, ConfigService],
    exports: [MailService],
})
export class MailModule {}
