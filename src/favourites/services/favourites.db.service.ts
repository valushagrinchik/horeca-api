import { Injectable } from '@nestjs/common'
import { DatabaseService } from '../../system/database/database.service'
import { FavouritesCreateDto } from '../dto/favourites.create.dto'

@Injectable()
export class FavouritesDbService {
    constructor(private db: DatabaseService) {}

    async create(userId: number, dto: FavouritesCreateDto) {
        return this.db.horecaFavourites.create({
            data: {
                ...dto,
                userId,
            },
        })
    }

    async delete(userId: number, providerId: number) {
        const fav = await this.db.horecaFavourites.findFirst({
            where: {
                userId,
                providerId,
            },
        })
        return this.db.horecaFavourites.delete({
            where: {
                id: fav.id,
            },
        })
    }
}
