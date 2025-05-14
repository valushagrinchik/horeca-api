import { BadRequestException, ExecutionContext, Type, createParamDecorator } from '@nestjs/common'
import type { Request as ExpressRequest } from 'express'
import { ErrorCodes } from '../../enums/errorCodes.enum'
import { ErrorDto } from '../../dto/error.dto'
import { plainToClass } from 'class-transformer'

export const RequestPaginatedValidateParamsDecorator = createParamDecorator(
    <T>(data: { search?: new () => T }, ctx: ExecutionContext) => {
        const request: ExpressRequest = ctx.switchToHttp().getRequest()

        const { sort, search, offset, limit } = request.query

        let sortType: PaginateValidateSortType | undefined = new PaginateValidateSortType({
            field: 'createdAt',
            order: 'desc',
        })
        if (sort) {
            const [field, order] = sort.toString().split('|')
            if (order.toLowerCase() !== 'asc' && order.toLowerCase() !== 'desc') {
                throw new BadRequestException(new ErrorDto(ErrorCodes.INVALID_QUERY_STRING))
            }
            sortType = new PaginateValidateSortType({ field, order: order.toLowerCase() as 'desc' | 'asc' })
        }

        return new PaginateValidateType<T>({
            offset: offset ? parseInt(offset.toString(), 10) : 0,
            limit: limit ? parseInt(limit.toString(), 10) : 60,
            search: search && data?.search ? plainToClass(data.search, search) : ({} as T),
            sort: sortType,
        })
    }
)

export class PaginateValidateType<T> {
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
