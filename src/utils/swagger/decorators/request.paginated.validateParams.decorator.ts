import { BadRequestException, ExecutionContext, createParamDecorator } from '@nestjs/common'
import type { Request as ExpressRequest } from 'express'
import { ErrorCodeEnum } from 'src/utils/error.code.enum'
import { ErrorDto } from 'src/utils/error.dto'

export const RequestPaginatedValidateParamsDecorator = createParamDecorator((data: unknown, ctx: ExecutionContext) => {
    const request: ExpressRequest = ctx.switchToHttp().getRequest()
    const query = request.query
    let search = {}
    if (query.search) {
        try {
            search = JSON.parse(query.search.toString())
        } catch (e) {
            throw new BadRequestException(new ErrorDto(ErrorCodeEnum.INVALID_QUERY_STRING))
        }
    }

    let sort: PaginateValidateSortType | undefined = new PaginateValidateSortType({ field: 'createdAt', order: 'desc' })
    if (query.sort) {
        //TODO Сделать проверку на валидность поля order
        const [field, order] = query.sort.toString().split('|')
        if (order !== 'asc' && order !== 'desc') {
            throw new BadRequestException(new ErrorDto(ErrorCodeEnum.INVALID_QUERY_STRING))
        }
        sort = new PaginateValidateSortType({ field, order: order })
    }

    return new PaginateValidateType({
        offset: query.offset ? parseInt(query.offset.toString(), 10) : 0,
        limit: query.limit ? parseInt(query.limit.toString(), 10) : 60,
        search: search,
        sort: sort,
    })
})

export class PaginateValidateType<T = object> {
    offset: number

    limit: number

    search: T

    sort: PaginateValidateSortType
    constructor(partial: Partial<PaginateValidateType<T>>) {
        Object.assign(this, partial)
    }
}

class PaginateValidateSortType {
    field: string
    order: 'asc' | 'desc'

    constructor(partial: Partial<PaginateValidateSortType>) {
        Object.assign(this, partial)
        this.order = this.order.toLowerCase() as 'asc' | 'desc'
    }
}
