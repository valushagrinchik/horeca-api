import { BadRequestException, Injectable } from '@nestjs/common'
import { ErrorCodes } from '../system/utils/enums/errorCodes.enum'
import { ErrorDto } from '../system/utils/dto/error.dto'
import { DatabaseService } from '../system/database/database.service'

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

    async findOne(id: number) {
        const upload = await this.prisma.upload.findUnique({
            where: { id },
        })
        if (!upload) {
            throw new BadRequestException(new ErrorDto(ErrorCodes.UPLOAD_NOT_FOUND))
        }
        return upload
    }

    async delete(id: number) {
        return this.prisma.upload.delete({
            where: { id },
        })
    }
}
