import { Injectable } from '@nestjs/common'
import { UploadsLinkType } from '@prisma/client'
import { DatabaseService } from '../system/database/database.service'
import { UploadDto } from './dto/upload.dto'

@Injectable()
export class UploadsLinkService {
    constructor(private prisma: DatabaseService) { }

    async getImages(sourceType: UploadsLinkType, sourceIds: number[]): Promise<Record<string, UploadDto[]>> {
        const images = await this.prisma.uploadsLink.findMany({
            where: {
                sourceType,
                sourceId: { in: sourceIds },
            },
            include: {
                image: true,
            },
        })
        const grouped = Object.groupBy(images, ({ sourceId }) => sourceId)
        return Object.fromEntries(
            Object.entries(grouped).map(([sourceId, images]) => [sourceId, images.map(image => image.image)])
        )
    }

    async createMany(sourceType: UploadsLinkType, sourceId: number, imageIds: number[]) {
        await this.prisma.uploadsLink.createMany({
            data: imageIds.map(imageId => ({
                imageId: +imageId,
                sourceType,
                sourceId,
            })),
        })
    }

    async deleteAllForSourceId(sourceType: UploadsLinkType, sourceId: number) {
        await this.prisma.uploadsLink.deleteMany({
            where: {
                sourceType,
                sourceId,
            },
        })
    }
}
