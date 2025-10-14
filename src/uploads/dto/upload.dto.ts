import { Upload } from '@prisma/client'

export class UploadDto implements Upload {
    id: number
    name: string

    mimetype: string
    size: number
    path: string
    chatId: number | null

    createdAt: Date
    updatedAt: Date

    isPrivate: boolean

    constructor(partial: Partial<UploadDto>, isPrivate = false) {
        Object.assign(this, partial)
        this.isPrivate = isPrivate

        if(this.isPrivate) {
            // private path for chat files through api call
            this.path = `api/uploads/chat/${this.chatId}/upload/${this.id}`
        }
    }
}

export class SourceWithUploads {
    images?: UploadDto[]
}
