import { HorecaFavourites } from '@prisma/client'

export class FavouriteDto implements HorecaFavourites {
    id: number
    userId: number

    providerId: number

    createdAt: Date
    updatedAt: Date

    constructor(partial: Partial<HorecaFavourites>) {
        Object.assign(this, partial)
    }
}
