import { ArgumentsHost, Catch, HttpStatus, Logger } from '@nestjs/common'
import { BaseExceptionFilter } from '@nestjs/core'
import { Prisma } from '@prisma/client'
import { Response } from 'express'
import { ErrorCodes } from './system/utils/enums/errorCodes.enum'

@Catch(Prisma.PrismaClientKnownRequestError)
export class ExceptionFilter extends BaseExceptionFilter {
    private readonly logger = new Logger(ExceptionFilter.name)

    catch(exception: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
        this.logger.warn(exception)
        const ctx = host.switchToHttp()
        const response = ctx.getResponse<Response>()
        const error = prismaCodeToError(exception)

        switch (exception.code) {
            case 'P2002': {
                response.status(HttpStatus.BAD_REQUEST).json({
                    statusCode: HttpStatus.BAD_REQUEST,
                    error,
                    message: [ErrorCodes[error]],
                })
                break
            }
            case 'P2003': {
                response.status(HttpStatus.BAD_REQUEST).json({
                    statusCode: HttpStatus.BAD_REQUEST,
                    error,
                    message: [ErrorCodes[error]],
                })
                break
            }
            default:
                // default 500 error code
                super.catch(exception, host)
                break
        }
    }
}

const prismaCodeToError = (error: Prisma.PrismaClientKnownRequestError) => {
    switch (error.code) {
        case 'P2002':
            return `${(error.meta.modelName as string).toUpperCase()}_ALREADY_EXISTS`
        case 'P2003':
            return `${(error.meta.modelName as string).toUpperCase()}_ACCOCIATIONS_DOES_NOT_EXIST`

        case 'P2025':
            return `${(error.meta.modelName as string).toUpperCase()}_NOT_FOUND`
    }
}
