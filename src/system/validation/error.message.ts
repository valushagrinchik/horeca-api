import { ValidationArguments } from 'class-validator'

import { ErrorValidationCodeEnum } from './error.validation.code.enum'

export const errorMessage = (validationArguments: ValidationArguments, message: ErrorValidationCodeEnum) => {
    return `${validationArguments.property}|${message}`
}
