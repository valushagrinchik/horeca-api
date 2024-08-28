import { Logger, Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { MailerModule } from '@nestjs-modules/mailer'
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter'

import { MailCronService } from './mail.cron.service'
import { MailService } from './mail.service'
import { PrismaService } from '../prisma.service'
import { CronPrismaService } from '../system/cron/cron.prisma.service'

@Module({
    imports: [
        MailerModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => ({
                transport: {
                    host: configService.get(`SMTP_HOST`),
                    port: configService.get(`SMTP_PORT`),
                    secure: false,
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
    ],
    providers: [MailService, PrismaService, CronPrismaService, MailCronService, Logger, ConfigService],
    exports: [MailService],
})
export class MailModule {}
