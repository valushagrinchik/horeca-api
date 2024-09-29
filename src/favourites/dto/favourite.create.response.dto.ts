import { ChatDto } from '../../chat/dto/chat.dto'
import { TypeValidate, Validate } from '../../system/utils/validation/validate.decotators'
import { FavouriteDto } from './favourite.dto'

export class FavouriteCreateResponseDto {
    @Validate(TypeValidate.OBJECT, { type: FavouriteDto })
    favourite: FavouriteDto
    @Validate(TypeValidate.OBJECT, { type: ChatDto })
    chat: ChatDto

    constructor(partial: Partial<FavouriteCreateResponseDto>) {
        Object.assign(this, partial)
    }
}
