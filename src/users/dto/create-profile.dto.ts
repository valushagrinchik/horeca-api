import { ProfileType } from '@prisma/client'
import { ValidateEnum } from '../../system/utils/validation/validate.decotators'

export class CreateProfileDto {
    @ValidateEnum(ProfileType, { enum: ProfileType, enumName: 'ProfileType' })
    profileType: ProfileType

    constructor(partial: Partial<CreateProfileDto>) {
        Object.assign(this, partial)
    }
}
