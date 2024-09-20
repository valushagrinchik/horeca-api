import { Module } from '@nestjs/common'
import { UsersModule } from '../users/users.module'
import { FavouritesController } from './favourites.controller'
import { FavouritesService } from './services/favourites.service'
import { FavouritesDbService } from './services/favourites.db.service'

@Module({
    imports: [UsersModule],
    controllers: [FavouritesController],
    providers: [FavouritesDbService, FavouritesService],
    exports: [FavouritesService],
})
export class FavouritesModule {}
