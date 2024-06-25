import { ApiProperty } from '@nestjs/swagger'

export class SuccessDto {
    @ApiProperty({ required: true })
    status: string

    constructor(message: string) {
        this.status = message
    }
}
