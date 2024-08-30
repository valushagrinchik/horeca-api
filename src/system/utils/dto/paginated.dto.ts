import { ApiProperty } from '@nestjs/swagger'

export class PaginatedDto<TData> {
    @ApiProperty({ type: 'array', description: 'Data items' })
    data: TData[]

    @ApiProperty({ description: 'Total number of items' })
    total: number

    constructor(data: TData[], total: number) {
        this.data = data
        this.total = total
    }
}
