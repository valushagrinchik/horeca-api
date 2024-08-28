import { getSchemaPath } from '@nestjs/swagger'
import { ProfileType } from '@prisma/client'
import { TypeValidate, Validate } from '../../system/validation/validate.decotators'
import { ValidateIf, ValidateNested } from 'class-validator'
import { Type } from 'class-transformer'
import { CreateProviderProfileDto } from './provider/create-provider-profile.dto'
import { CreateHorecaProfileDto } from './horeca/create-horeca-profile.dto'
import { Match } from '../../system/auth/decorators/match.decorator'

export class RegistrateUserDto {
    @Validate(TypeValidate.STRING)
    name: string

    @Validate(TypeValidate.STRING)
    tin: string

    @Validate(TypeValidate.BOOLEAN)
    GDPRApproved: boolean

    @Validate(TypeValidate.STRING)
    email: string

    @Validate(TypeValidate.STRING)
    phone: string

    @Validate(TypeValidate.STRING)
    password: string

    @Validate(TypeValidate.STRING)
    @ValidateIf(o => o.password !== o.repeatPassword)
    @Match(RegistrateUserDto, s => s.password)
    repeatPassword: string

    @Validate(TypeValidate.OBJECT, {
        oneOf: [{ $ref: getSchemaPath(CreateHorecaProfileDto) }, { $ref: getSchemaPath(CreateProviderProfileDto) }],
    })
    @ValidateNested()
    @Type(({ object }) =>
        object.profile.profileType == ProfileType.Horeca ? CreateHorecaProfileDto : CreateProviderProfileDto
    )
    profile: CreateHorecaProfileDto | CreateProviderProfileDto
}
