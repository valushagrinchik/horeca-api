import { ApiProperty } from '@nestjs/swagger'
import { Prisma, ProposalTemplate } from '@prisma/client'

export class ProposalTemplateDto implements ProposalTemplate {
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

    constructor(partial: Partial<ProposalTemplate>) {
        Object.assign(this, partial)
    }
}
