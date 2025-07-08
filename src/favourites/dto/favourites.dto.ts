import { ProviderUserDto, Validate, TypeValidate } from '@/shared/utils'
import { UploadDto } from '@/uploads/dto/upload.dto'
import { HorecaFavourites } from '@prisma/client'
import { Type } from 'class-transformer'
import { ValidateNested } from 'class-validator'

export class FavouritesUserDto {
    name: string

    @Validate(TypeValidate.OBJECT, { required: false })
    @ValidateNested()
    @Type(() => UploadDto)
    avatar?: UploadDto

    constructor(partial: Partial<FavouritesUserDto> & { avatar?: UploadDto }) {
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
