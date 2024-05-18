import { ApiProperty } from '@nestjs/swagger'

import { ErrorCodeEnum } from './error.code.enum'
import { ErrorValidationCodeEnum } from './validation/error.validation.code.enum'

export class ErrorDto {
    @ApiProperty({ enum: ErrorCodeEnum, required: false, example: ErrorCodeEnum.AUTH_FAIL })
    errorMessage?: ErrorCodeEnum

    @ApiProperty({
        type: () => String,
        required: false,
        isArray: true,
        example: [`password|${ErrorValidationCodeEnum.IS_NOT_EMPTY}`],
    })
    message?: string[]

    @ApiProperty({ example: 'Bad Request' })
    error: string

    @ApiProperty({ example: 400 })
    statusCode: number

    constructor(message: ErrorCodeEnum) {
        this.statusCode = 400
        this.error = 'Bad Request'
        this.errorMessage = message
    }
}
