import { Module } from '@nestjs/common'
import { UsersModule } from './users/users.module'
import { ConfigModule } from '@nestjs/config'
import { ProductsModule } from './products/products.module'
// import { MailModule } from './mail/mail.module'
import { ScheduleModule } from '@nestjs/schedule'
// import { UploadsModule } from './uploads/uploads.module'
import { ChatModule } from './chat/chat.module'
// import { ProviderRequestsModule } from './providerRequests/providerRequests.module'
// import { HorecaRequestsModule } from './horecaRequests/horecaRequests.module'
import { DatabaseModule } from './system/database/database.module'

@Module({
    imports: [
        ConfigModule.forRoot({
            envFilePath: process.env.NODE_ENV == 'test' ? '.env.test' : '.env',
            isGlobal: true,
        }),

        DatabaseModule,
        ScheduleModule.forRoot(),

        // Services
        // MailModule,
        // UploadsModule,
        UsersModule,
        // HorecaRequestsModule,
        // ProviderRequestsModule,
        ProductsModule,
        ChatModule,
    ],
    controllers: [],
    providers: [],
})
export class AppModule {}
