import { applyDecorators } from '@nestjs/common'
import { ApiBody, ApiResponse } from '@nestjs/swagger'
import { ErrorDto } from '../../error.dto'

export function DockGet(success = null) {
    return applyDecorators(ApiResponse({ status: 200, type: success }), ApiResponse({ status: 400, type: ErrorDto }))
}

export function DockPost(dto = null, success = null, error = ErrorDto) {
    const decorators: ClassDecorator | MethodDecorator[] = [
        ApiResponse({ status: 400, type: error }),
        ApiResponse({ status: 200, type: success }),
    ]

    if (dto) decorators.push(ApiBody({ type: dto }))

    return applyDecorators(...decorators)
}
