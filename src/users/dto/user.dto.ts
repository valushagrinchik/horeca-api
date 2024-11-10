import { ApiProperty, getSchemaPath } from '@nestjs/swagger'
import { Profile, ProfileType, User, UserRole } from '@prisma/client'
import { Exclude, Transform, Type } from 'class-transformer'
import { HorecaProfileDto } from './horeca/horeca-profile.dto'
import { ProviderProfileDto } from './provider/provider-profile.dto'

export class UserDto implements User {
    id: number

    @ApiProperty({ enum: UserRole, enumName: 'UserRole' })
    role: UserRole

    name: string

    tin: string

    email: string

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
        if (value.profileType == ProfileType.Horeca) {
            return new HorecaProfileDto(value)
        }
        if (value.profileType == ProfileType.Provider) {
            return new ProviderProfileDto(value)
        }
        return null
    })
    profile: HorecaProfileDto | ProviderProfileDto | null

    constructor(partial: Partial<User & { profile: Profile }>) {
        Object.assign(this, partial)
    }
}
