import { forwardRef, Module } from '@nestjs/common'
import { UsersModule } from '../users/users.module'
import { FavouritesController } from './favourites.controller'
import { FavouritesService } from './services/favourites.service'
import { FavouritesDbService } from './services/favourites.db.service'
import { NotificationModule } from '../notifications/notification.module'
import { UploadsModule } from '@/uploads/uploads.module'

@Module({
    imports: [forwardRef(() => UsersModule), forwardRef(() => NotificationModule), forwardRef(() => UploadsModule)],
    controllers: [FavouritesController],
    providers: [FavouritesDbService, FavouritesService],
    exports: [FavouritesService],
})
export class FavouritesModule {}
