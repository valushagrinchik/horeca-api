import { Module } from '@nestjs/common'
import { UsersModule } from './users/users.module'
import { ConfigModule } from '@nestjs/config'
import { ProposalsModule } from './proposals/proposals.module'

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
        }),
        UsersModule,
        ProposalsModule
    ],
    controllers: [],
    providers: [],
})
export class AppModule {}
