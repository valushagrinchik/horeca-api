import { ApiProperty } from '@nestjs/swagger'
import { UserRole } from '@prisma/client'

export class AuthInfoDto {
    @ApiProperty({ required: true })
    readonly id: number

    @ApiProperty({ required: true, enum: UserRole })
    readonly role: UserRole
}
