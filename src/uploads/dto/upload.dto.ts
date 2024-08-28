import { Upload } from '@prisma/client'
import { Exclude } from 'class-transformer'

export class UploadDto implements Upload {
    id: number
    name: string

    @Exclude()
    mimetype: string
    @Exclude()
    size: number
    @Exclude()
    path: string

    createdAt: Date
    updatedAt: Date

    constructor(partial: Partial<UploadDto>) {
        Object.assign(this, partial)
    }
}
