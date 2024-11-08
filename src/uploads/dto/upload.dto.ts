import { Upload } from '@prisma/client'

export class UploadDto implements Upload {
    id: number
    name: string

    mimetype: string
    size: number
    path: string

    createdAt: Date
    updatedAt: Date

    constructor(partial: Partial<UploadDto>) {
        Object.assign(this, partial)
    }
}

export class SourceWithUploads {
    images?: UploadDto[]
}
