import { Module } from '@nestjs/common'
import { UsersModule } from '../users/users.module'
import { FavouritesController } from './favourites.controller'
import { FavouritesService } from './services/favourites.service'
import { FavouritesDbService } from './services/favourites.db.service'
import { NotificationModule } from '../notifications/notification.module'

@Module({
    imports: [UsersModule, NotificationModule],
    controllers: [FavouritesController],
    providers: [FavouritesDbService, FavouritesService],
    exports: [FavouritesService],
})
export class FavouritesModule {}
