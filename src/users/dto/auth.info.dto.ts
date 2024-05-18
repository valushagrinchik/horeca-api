import { ApiProperty } from '@nestjs/swagger'

export class AuthInfoDto {
    @ApiProperty({ required: true })
    readonly id: number
}
