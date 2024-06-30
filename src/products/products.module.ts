import { Module } from '@nestjs/common'
import { PrismaService } from '../prisma.service'
import { UsersModule } from '../users/users.module'
import { ProductsProviderService } from './products.provider.service'
import { ProductsProviderController } from './products.provider.controller'

@Module({
    imports: [UsersModule],
    controllers: [ProductsProviderController],
    providers: [PrismaService, ProductsProviderService],
})
export class ProductsModule {}
