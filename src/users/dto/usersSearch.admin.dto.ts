import { UserRole } from '@prisma/client'
import { TypeValidate, Validate, ValidateEnum } from '../../system/utils/validation/validate.decotators'

export class UsersSearchAdminDto {
    @Validate(TypeValidate.STRING, { required: false })
    email?: string

    @ValidateEnum(UserRole, { required: false, enum: UserRole, enumName: 'UserRole' })
    role?: UserRole
}
