import { applyDecorators } from '@nestjs/common'
import { ApiBody, ApiResponse } from '@nestjs/swagger'
import { ErrorDto } from '../../error.dto'

export function RequestDecorator(success = null, dto = null, error = ErrorDto) {
    const decorators: ClassDecorator | MethodDecorator[] = [
        ApiResponse({ status: 400, type: error }),
        ApiResponse({ status: 200, type: success }),
    ]

    if (dto) decorators.push(ApiBody({ type: dto }))

    return applyDecorators(...decorators)
}
