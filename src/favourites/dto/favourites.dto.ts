import { HorecaFavourites } from '@prisma/client'

export class FavouritesDto implements HorecaFavourites {
    providerId: number
    id: number
    userId: number
    chatId: number
    createdAt: Date
    updatedAt: Date

    constructor(partial: Partial<HorecaFavourites>) {
        Object.assign(this, partial)
    }
}
