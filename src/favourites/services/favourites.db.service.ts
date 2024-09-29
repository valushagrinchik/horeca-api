import { Injectable } from '@nestjs/common'
import { DatabaseService } from '../../system/database/database.service'
import { FavouritesCreateDto } from '../dto/favourites.create.dto'
import { Prisma } from '@prisma/client'

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

    async find(where: Prisma.HorecaFavouritesWhereInput) {
        return this.db.horecaFavourites.findFirst({
            where,
        })
    }

    async delete(userId: number, providerId: number) {
        const fav = await this.db.horecaFavourites.findFirst({
            where: {
                userId,
                providerId,
            },
        })
        await this.db.horecaFavourites.delete({
            where: {
                id: fav.id,
            },
        })

        return fav
    }
}
