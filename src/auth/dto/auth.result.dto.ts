import { ApiProperty } from '@nestjs/swagger'

export class AuthResultDto {
    @ApiProperty({ required: true })
    readonly accessToken: string

    @ApiProperty({ required: true })
    readonly refreshToken: string
}
