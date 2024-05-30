import { getSchemaPath } from '@nestjs/swagger'
import { ProfileType } from '@prisma/client'
import { TypeValidate, Validate } from 'src/utils/validation/validate.decotators'
import { ValidateIf, ValidateNested } from 'class-validator'
import { Type } from 'class-transformer'
import { CreateHorecaProfileDto } from './horeca/create-horeca-profile.dto'
import { CreateProviderProfileDto } from './provider/create-provider-profile.dto'

export class UpdateUserDto {
    @Validate(TypeValidate.STRING)
    name: string

    @Validate(TypeValidate.STRING)
    email: string

    @Validate(TypeValidate.STRING)
    phone: string

    @Validate(TypeValidate.OBJECT, {
        oneOf: [{ $ref: getSchemaPath(CreateHorecaProfileDto) }, { $ref: getSchemaPath(CreateProviderProfileDto) }],
    })
    @ValidateNested()
    @ValidateIf(o => o.profileType)
    @Type(({ object }) => object.profileType == ProfileType.Horeca ? CreateHorecaProfileDto : CreateProviderProfileDto)
    profile: CreateHorecaProfileDto | CreateProviderProfileDto
}
