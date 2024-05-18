import { TypeValidate, Validate } from 'src/utils/validation/validate.decotators'

export class LoginUserDto {
    @Validate(TypeValidate.STRING)
    email: string

    @Validate(TypeValidate.STRING)
    password: string
}
