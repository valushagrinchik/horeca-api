import { ApiProperty } from '@nestjs/swagger'
import { HorecaApplication, HorecaApplicationImage, HorecaApplicationItem, HorecaApplicationTemplate, PaymentType, Prisma } from '@prisma/client'

export class ProposalTemplateHorecaDto implements HorecaApplicationTemplate {
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

    constructor(partial: Partial<HorecaApplicationTemplate>) {
        Object.assign(this, partial)
    }
}