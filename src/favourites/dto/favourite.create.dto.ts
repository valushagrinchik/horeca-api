import { TypeValidate, Validate } from '../../system/utils/validation/validate.decotators'

export class FavouriteCreateDto {
    @Validate(TypeValidate.NUMBER)
    providerId: number
}
