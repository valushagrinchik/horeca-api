import { ProviderUserDto } from '@/shared/utils'
import { HorecaFavourites } from '@prisma/client'

export class FavouritesUserDto {
    name: string
    constructor(partial: Partial<FavouritesUserDto>) {
        Object.assign(this, partial)
    }
}
export class FavouritesDto implements HorecaFavourites {
    providerId: number
    id: number
    userId: number
    chatId: number
    createdAt: Date
    updatedAt: Date
    user: FavouritesUserDto
    provider: ProviderUserDto

    constructor(partial: Partial<HorecaFavourites & { user: FavouritesUserDto; provider: ProviderUserDto }>) {
        Object.assign(this, partial)
    }
}
