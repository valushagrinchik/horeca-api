import { UserRole } from '@prisma/client'
import { ValidateEnum } from '../../system/utils/validation/validate.decotators'

export class UsersSearchAdminDto {
    @ValidateEnum(UserRole, { required: false, enum: UserRole, enumName: 'UserRole' })
    role?: UserRole
}
