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

    async findAll(args: Prisma.HorecaFavouritesFindManyArgs) {
        return this.db.horecaFavourites.findMany(args)
    }

    async count(args: Prisma.HorecaFavouritesCountArgs) {
        return this.db.horecaFavourites.count(args)
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
