import { UserRole } from '@prisma/client'
import { ValidateEnum } from '@/shared/utils'

export class UsersSearchAdminDto {
    @ValidateEnum(UserRole, { required: false, enum: UserRole, enumName: 'UserRole' })
    role?: UserRole
}
