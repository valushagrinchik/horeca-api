import { BadRequestException, ExecutionContext, Type, createParamDecorator } from '@nestjs/common'
import type { Request as ExpressRequest } from 'express'
import { ErrorCodes } from '../../enums/errorCodes.enum'
import { ErrorDto } from '../../dto/error.dto'

export const RequestPaginatedValidateParamsDecorator = createParamDecorator((data: unknown, ctx: ExecutionContext) => {
    const request: ExpressRequest = ctx.switchToHttp().getRequest()
    const { sort, search: searchInput, offset, limit } = request.query
    let search = {}
    let sortType: PaginateValidateSortType | undefined = new PaginateValidateSortType({
        field: 'createdAt',
        order: 'desc',
    })
    if (sort) {
        //TODO Сделать проверку на валидность поля order
        const [field, order] = sort.toString().split('|')
        if (order !== 'asc' && order !== 'desc') {
            throw new BadRequestException(new ErrorDto(ErrorCodes.INVALID_QUERY_STRING))
        }
        sortType = new PaginateValidateSortType({ field, order: order })
    }

    if (searchInput) {
        search = JSON.parse(searchInput.toString())
    }

    return new PaginateValidateType({
        offset: offset ? parseInt(offset.toString(), 10) : 0,
        limit: limit ? parseInt(limit.toString(), 10) : 60,
        search,
        sort: sortType,
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
