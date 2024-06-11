import { Module } from '@nestjs/common'
import { UsersModule } from './users/users.module'
import { ConfigModule } from '@nestjs/config'
import { ProposalsModule } from './proposals/proposals.module'
import { ProductsModule } from './products/products.module'

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
        }),
        UsersModule,
        ProposalsModule,
        ProductsModule
    ],
    controllers: [],
    providers: [],
})
export class AppModule {}
