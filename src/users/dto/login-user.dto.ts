import { TypeValidate, Validate } from '../../utils/validation/validate.decotators'

export class LoginUserDto {
    @Validate(TypeValidate.STRING)
    email: string

    @Validate(TypeValidate.STRING)
    password: string
}
