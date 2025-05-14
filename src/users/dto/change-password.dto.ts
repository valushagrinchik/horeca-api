import { TypeValidate, Validate } from '@/shared/utils'
import { ValidateIf } from 'class-validator'
import { Match } from '../../auth/decorators'

export class ChangePasswordDto {
    @Validate(TypeValidate.STRING, { required: false })
    password?: string

    @Validate(TypeValidate.STRING, { required: false })
    @Match(ChangePasswordDto, s => s.password)
    @ValidateIf(o => o.password && o.password !== o.repeatPassword)
    repeatPassword?: string
}
