import { SourceWithUploads } from '@/uploads/dto/upload.dto'
import { ApiProperty } from '@nestjs/swagger'
import { HorecaRequestTemplate, Prisma } from '@prisma/client'

export class HorecaRequestTemplateDto extends SourceWithUploads implements HorecaRequestTemplate {
    @ApiProperty()
    id: number

    @ApiProperty()
    name: string

    @ApiProperty()
    userId: number

    @ApiProperty()
    content: Prisma.JsonObject

    @ApiProperty()
    createdAt: Date

    @ApiProperty()
    updatedAt: Date

    constructor(partial: Partial<HorecaRequestTemplate & SourceWithUploads>) {
        super()
        Object.assign(this, partial)
    }
}
