import { ValidationArguments } from 'class-validator'

import { ErrorValidationCodeEnum } from '../enums/error.validation.code.enum'

export const errorMessage = (validationArguments: ValidationArguments, message: ErrorValidationCodeEnum) => {
    return `${validationArguments.property}|${message}`
}
