import { Module } from '@nestjs/common'
import { UsersModule } from './users/users.module'
import { ConfigModule } from '@nestjs/config'
import { ProposalsModule } from './proposals/proposals.module'
import { MailModule } from './mail/mail.module'
import { ScheduleModule } from '@nestjs/schedule'

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
        }),

        ScheduleModule.forRoot(),

        // Services
        UsersModule,
        MailModule,
        ProposalsModule
    ],
    controllers: [],
    providers: [],
})
export class AppModule {}
