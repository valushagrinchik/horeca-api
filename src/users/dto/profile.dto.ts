import { ProfileType } from "@prisma/client"
import { TypeValidate, Validate, ValidateEnum } from "src/utils/validation/validate.decotators"

export class Profile {
    @Validate(TypeValidate.STRING)
    @ValidateEnum(ProfileType, { type: ProfileType, enum: ProfileType, enumName: 'ProfileType' })
    profileType: ProfileType
    
    constructor(partial: Partial<Profile>) {
        Object.assign(this, partial)
    }
}