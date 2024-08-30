import { ApiProperty } from '@nestjs/swagger'

import { ErrorCodes } from '../enums/errorCodes.enum'
import { ErrorValidationCodeEnum } from '../validation/error.validation.code.enum'

export class ErrorDto {
    @ApiProperty({ enum: ErrorCodes, required: false, example: ErrorCodes.AUTH_FAIL })
    errorMessage?: ErrorCodes

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

    constructor(message: ErrorCodes) {
        this.statusCode = 400
        this.error = 'Bad Request'
        this.errorMessage = message
    }
}
