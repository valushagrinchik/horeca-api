import { ApiProperty, getSchemaPath } from '@nestjs/swagger'
import { ProfileType, User, UserRole } from '@prisma/client'
import { Exclude, Transform, Type } from 'class-transformer'
import { HorecaProfileDto } from './horeca/horeca-profile.dto'
import { ProviderProfileDto } from './provider/provider-profile.dto'

export class UserDto implements User {
    @ApiProperty()
    id: number

    @ApiProperty({ enum: UserRole })
    role: UserRole

    @ApiProperty()
    name: string

    @ApiProperty()
    tin: string

    @ApiProperty()
    email: string

    @ApiProperty()
    phone: string

    @Exclude()
    password: string

    createdAt: Date
    updatedAt: Date

    @Exclude()
    activationLink: string

    @Exclude()
    isActivated: boolean

    @ApiProperty({ oneOf: [{ $ref: getSchemaPath(HorecaProfileDto) }, { $ref: getSchemaPath(ProviderProfileDto) }] })
    @Type(({ object }) => (object.profile.profileType == ProfileType.Horeca ? HorecaProfileDto : ProviderProfileDto))
    @Transform(({ value }) => {
        return value.profileType == ProfileType.Horeca ? new HorecaProfileDto(value) : new ProviderProfileDto(value)
    })
    profile: HorecaProfileDto | ProviderProfileDto

    constructor(partial: Partial<User>) {
        Object.assign(this, partial)
    }
}
