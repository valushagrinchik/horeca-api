import { ApiProperty } from "@nestjs/swagger"
import { Upload } from "@prisma/client"

export class UploadDto implements Upload {
    @ApiProperty()
    id: number
    @ApiProperty()
    name: string
    @ApiProperty()
    mimetype: string
    @ApiProperty()
    path: string
    @ApiProperty()
    size: number
    @ApiProperty()
    createdAt: Date
    @ApiProperty()
    updatedAt: Date

    constructor(partial: Partial<Upload>) {
        Object.assign(this, partial)
    }
}

export class SourceWithUploads {
    images: UploadDto[]
}

