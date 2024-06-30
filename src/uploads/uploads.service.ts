import { BadRequestException, Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma.service'
import { ErrorCodeEnum } from '../utils/error.code.enum'
import { ErrorDto } from '../utils/error.dto'

@Injectable()
export class UploadsService {
    constructor(private prisma: PrismaService) {}

    async upload(file: Express.Multer.File) {
        const upload = await this.prisma.uploads.create({
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
        const upload = await this.prisma.uploads.findUnique({
            where: { id },
        })
        if (!upload) {
            throw new BadRequestException(new ErrorDto(ErrorCodeEnum.UPLOAD_NOT_FOUND))
        }
        return upload
    }
    async delete(id: number) {
        return this.prisma.uploads.delete({
            where: { id },
        })
    }
}
