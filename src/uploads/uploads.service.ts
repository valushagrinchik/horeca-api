import { BadRequestException, Injectable } from '@nestjs/common'
import { ErrorCodes, ErrorDto } from '@/shared/utils'
import { DatabaseService } from '../system/database/database.service'
import { createReadStream } from 'fs'
import { Upload } from '@prisma/client'

@Injectable()
export class UploadsService {
    constructor(private prisma: DatabaseService) {}

    async upload(file: Express.Multer.File) {
        const upload = await this.prisma.upload.create({
            data: {
                name: file.originalname,
                mimetype: file.mimetype,
                size: file.size,
                path: file.path,
            },
        })
        return upload
    }

    async uploadForChat(file: Express.Multer.File, chatId: number) {
        const upload = await this.prisma.upload.create({
            data: {
                name: file.originalname,
                mimetype: file.mimetype,
                size: file.size,
                path: file.path,
                chatId,
            },
        })
        return upload
    }

    async findOne(id: number, chatId: number) {
        const upload = await this.prisma.upload.findFirst({
            where: { id, chatId },
        })
        if (!upload) {
            throw new BadRequestException(new ErrorDto(ErrorCodes.UPLOAD_NOT_FOUND))
        }
        return upload
    }

    async findAllForChat(chatId: number) {
        return this.prisma.upload.findMany({
            where: { chatId },
            orderBy: { createdAt: 'desc' }
        })
    }

    async readUpload(upload: Upload) {
        return createReadStream(upload.path)
    }

    async delete(id: number) {
        return this.prisma.upload.delete({
            where: { id },
        })
    }
}
