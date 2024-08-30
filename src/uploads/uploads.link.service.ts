import { Injectable } from '@nestjs/common'
import { UploadsLinkType } from '@prisma/client'
import { DatabaseService } from '../system/database/database.service'

@Injectable()
export class UploadsLinkService {
    constructor(private prisma: DatabaseService) {}

    async getImages(sourceType: UploadsLinkType, sourceIds: number[]) {
        const images = await this.prisma.uploadsLink.findMany({
            where: {
                sourceType,
                sourceId: { in: sourceIds },
            },
            include: {
                image: true,
            },
        })
        return Object.groupBy(images, ({ sourceId }) => sourceId)
    }

    async createMany(sourceType: UploadsLinkType, sourceId: number, imageIds: number[]) {
        await this.prisma.uploadsLink.createMany({
            data: imageIds.map(imageId => ({
                imageId,
                sourceType,
                sourceId,
            })),
        })
    }
}
