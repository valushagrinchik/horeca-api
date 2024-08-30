import { Module } from '@nestjs/common'
import { UsersModule } from '../users/users.module'
import { ProductsService } from './products.service'
import { ProductsController } from './products.controller'
import { UploadsModule } from '../uploads/uploads.module'

@Module({
    imports: [UsersModule, UploadsModule],
    controllers: [ProductsController],
    providers: [ProductsService],
})
export class ProductsModule {}
