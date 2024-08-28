import { ApiProperty } from '@nestjs/swagger'
import { HorecaRequestTemplate, Prisma } from '@prisma/client'

export class HorecaRequestTemplateDto implements HorecaRequestTemplate {
    @ApiProperty()
    id: number

    @ApiProperty()
    name: string

    @ApiProperty()
    content: Prisma.JsonObject

    @ApiProperty()
    createdAt: Date

    @ApiProperty()
    updatedAt: Date

    constructor(partial: Partial<HorecaRequestTemplate>) {
        Object.assign(this, partial)
    }
}
