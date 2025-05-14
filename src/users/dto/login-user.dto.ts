import { TypeValidate, Validate } from '@/shared/utils'

export class LoginUserDto {
    @Validate(TypeValidate.STRING)
    email: string

    @Validate(TypeValidate.STRING)
    password: string
}
