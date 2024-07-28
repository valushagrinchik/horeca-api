import { Module } from '@nestjs/common'
import { UsersModule } from './users/users.module'
import { ConfigModule } from '@nestjs/config'
import { ProposalsModule } from './proposals/proposals.module'
import { ProductsModule } from './products/products.module'
import { MailModule } from './mail/mail.module'
import { ScheduleModule } from '@nestjs/schedule'
import { UploadsModule } from './uploads/uploads.module'
import { ChatModule } from './chat/chat.module'

@Module({
    imports: [
        ConfigModule.forRoot({
            envFilePath: `.env.${process.env.NODE_ENV}`,
            isGlobal: true,
        }),

        ScheduleModule.forRoot(),

        // Services
        MailModule,
        UploadsModule,
        UsersModule,
        ProposalsModule,
        ProductsModule,
        ChatModule
    ],
    controllers: [],
    providers: [],
})
export class AppModule {}
