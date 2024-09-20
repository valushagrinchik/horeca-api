import { TypeValidate, Validate } from '../../system/utils/validation/validate.decotators'

export class FavouritesCreateDto {
    @Validate(TypeValidate.NUMBER)
    providerId: number
}
