import { ArgumentsHost, Catch, HttpStatus, Logger, BadRequestException } from '@nestjs/common'
import { BaseExceptionFilter } from '@nestjs/core'
import { Prisma } from '@prisma/client'
import { Response } from 'express'
import { ErrorCodes } from '@/shared/utils'

@Catch()
export class ExceptionFilter extends BaseExceptionFilter {
    private readonly logger = new Logger(ExceptionFilter.name)

    catch(exception: any, host: ArgumentsHost) {
        this.logger.warn(exception)
        const ctx = host.switchToHttp()
        const response = ctx.getResponse<Response>()

        // Handle Prisma errors
        if (exception instanceof Prisma.PrismaClientKnownRequestError) {
            const error = prismaCodeToError(exception)

            switch (exception.code) {
                case 'P2002': {
                    response.status(HttpStatus.BAD_REQUEST).json({
                        statusCode: HttpStatus.BAD_REQUEST,
                        error,
                        message: [ErrorCodes[error]],
                    })
                    return
                }
                case 'P2003': {
                    response.status(HttpStatus.BAD_REQUEST).json({
                        statusCode: HttpStatus.BAD_REQUEST,
                        error,
                        message: [ErrorCodes[error]],
                    })
                    return
                }
            }
        }

        // Handle file upload errors (from FileInterceptor)
        if (exception instanceof BadRequestException) {
            const errorMessage = exception.message
            
            // Check if it's one of our custom file upload error codes
            if (Object.values(ErrorCodes).includes(errorMessage as ErrorCodes)) {
                response.status(HttpStatus.BAD_REQUEST).json({
                    statusCode: HttpStatus.BAD_REQUEST,
                    error: errorMessage,
                    message: [errorMessage],
                })
                return
            }
        }

        // Default handling for other exceptions
        super.catch(exception, host)
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
