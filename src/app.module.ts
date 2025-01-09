import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common'
import { UsersModule } from './users/users.module'
import { ConfigModule } from '@nestjs/config'
import { ProductsModule } from './products/products.module'
import { MailModule } from './mail/mail.module'
import { ScheduleModule } from '@nestjs/schedule'
import { UploadsModule } from './uploads/uploads.module'
import { ChatModule } from './chat/chat.module'
import { ProviderRequestsModule } from './providerRequests/providerRequests.module'
import { HorecaRequestsModule } from './horecaRequests/horecaRequests.module'
import { DatabaseModule } from './system/database/database.module'
import { FavouritesModule } from './favourites/favourites.module'
import { CronModule } from './system/cron/cron.module'
import { ReviewsModule } from './reviews/reviews.module'
import { NotificationModule } from './notifications/notification.module'
import { SupportRequestsModule } from './supportRequests/supportRequests.module'
import { HorecaPrivateRequestsModule } from './horecaPrivateRequests/horecaPrivateRequests.module'
import { AppLoggerMiddleware } from './app.logger.middleware'
import * as winston from 'winston'
import 'winston-daily-rotate-file';
import { utilities as nestWinstonModuleUtilities, WinstonModule } from 'nest-winston';
import * as path from 'path';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
        }),

        DatabaseModule,
        CronModule,
        ScheduleModule.forRoot(),

        // Services
        MailModule,
        UploadsModule,
        UsersModule,
        HorecaRequestsModule,
        ProviderRequestsModule,
        ProductsModule,
        ChatModule,
        FavouritesModule,
        ReviewsModule,
        NotificationModule,
        SupportRequestsModule,
        HorecaPrivateRequestsModule,

        WinstonModule.forRoot({
            transports: [
                new winston.transports.Console({
                    format: winston.format.combine(
                        winston.format.timestamp(),
                        winston.format.ms(),
                        nestWinstonModuleUtilities.format.nestLike('HorecaAPI', {
                            colors: true,
                            prettyPrint: true,
                            processId: true,
                            appName: true,
                        })
                    ),
                }),
                new winston.transports.DailyRotateFile({
                    format: winston.format.combine(
                        winston.format.timestamp(),
                        winston.format.ms(),
                        nestWinstonModuleUtilities.format.nestLike('HorecaAPI', {
                            colors: false,
                            prettyPrint: true,
                            processId: true,
                            appName: true,
                        })
                    ),
                    dirname: path.join(__dirname, './../logs'),
                    filename: 'info.log',
                    level: 'info', //info, warn and error
                    datePattern: 'YYYY-MM-DD',
                    zippedArchive: true,
                    maxSize: '20m',
                    maxFiles: '7d'
                }),
            ],
        }),
    ],
    controllers: [],
    providers: [],
})
export class AppModule implements NestModule {
    configure(consumer: MiddlewareConsumer): void {
        consumer.apply(AppLoggerMiddleware).forRoutes('*')
    }
}