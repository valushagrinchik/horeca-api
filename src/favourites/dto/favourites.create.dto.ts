import { TypeValidate, Validate } from '@/shared/utils/validation/validate.decotators'

export class FavouritesCreateDto {
    @Validate(TypeValidate.NUMBER)
    providerId: number
}
