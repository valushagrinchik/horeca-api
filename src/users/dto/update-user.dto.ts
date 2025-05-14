import { getSchemaPath } from '@nestjs/swagger'
import { ProfileType } from '@prisma/client'
import { TypeValidate, Validate } from '@/shared/utils'
import { ValidateIf, ValidateNested } from 'class-validator'
import { Type } from 'class-transformer'
import { CreateHorecaProfileDto } from './horeca/create-horeca-profile.dto'
import { CreateProviderProfileDto } from './provider/create-provider-profile.dto'
import { Match } from '../../auth/decorators'

export class UpdateUserDto {
    @Validate(TypeValidate.STRING, { required: false })
    name?: string

    @Validate(TypeValidate.STRING, { required: false })
    email?: string

    @Validate(TypeValidate.STRING, { required: false })
    phone?: string

    @Validate(TypeValidate.STRING, { required: false })
    password?: string

    @Validate(TypeValidate.STRING, { required: false })
    @Match(UpdateUserDto, s => s.password)
    @ValidateIf(o => o.password && o.password !== o.repeatPassword)
    repeatPassword?: string

    @Validate(TypeValidate.OBJECT, {
        oneOf: [{ $ref: getSchemaPath(CreateHorecaProfileDto) }, { $ref: getSchemaPath(CreateProviderProfileDto) }],
        required: false,
    })
    @Type(({ object }) => {
        if (!object?.profile?.profileType) return Object
        return object.profile.profileType == ProfileType.Horeca ? CreateHorecaProfileDto : CreateProviderProfileDto
    })
    @ValidateNested()
    profile: Partial<CreateHorecaProfileDto | CreateProviderProfileDto>

    @Validate(TypeValidate.NUMBER, { required: false })
    avatar?: number
}
