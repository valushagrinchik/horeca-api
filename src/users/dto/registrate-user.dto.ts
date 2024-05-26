import { getSchemaPath } from '@nestjs/swagger'
import { HorecaProfileDto } from './horeca-profile.dto'
import { ProviderProfileDto } from './provider-profile.dto'
import { ProfileType } from '@prisma/client'
import { TypeValidate, Validate, ValidateEnum } from 'src/utils/validation/validate.decotators'
import { ValidateIf, ValidateNested } from 'class-validator'
import { Type } from 'class-transformer'

export class RegistrateUserDto {
    @Validate(TypeValidate.STRING)
    name: string

    @Validate(TypeValidate.STRING)
    tin: string

    @Validate(TypeValidate.STRING)
    email: string

    @Validate(TypeValidate.STRING)
    phone: string

    @Validate(TypeValidate.STRING)
    password: string

    @Validate(TypeValidate.STRING)
    @ValidateIf(o => o.password !== o.repeatPassword)
    repeatPassword: string

    @Validate(TypeValidate.STRING)
    @ValidateEnum(ProfileType, { type: ProfileType, enum: ProfileType, enumName: 'ProfileType' })
    profileType: ProfileType

    @Validate(TypeValidate.OBJECT, {
        oneOf: [{ $ref: getSchemaPath(HorecaProfileDto) }, { $ref: getSchemaPath(ProviderProfileDto) }],
    })
    @ValidateNested()
    @ValidateIf(o => o.profileType)
    @Type(({ object }) => object.profileType == ProfileType.Horeca ? HorecaProfileDto : ProviderProfileDto)
    profile: HorecaProfileDto | ProviderProfileDto
}
