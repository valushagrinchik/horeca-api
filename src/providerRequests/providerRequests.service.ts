import { Injectable } from '@nestjs/common'

import { AuthInfoDto } from '../users/dto/auth.info.dto'
import { UploadsLinkType } from '@prisma/client'
import { ProviderRequestCreateDto } from './dto/providerRequest.create.dto'
import { ProviderRequestDto } from './dto/providerRequest.dto'
import { UploadsLinkService } from '../uploads/uploads.link.service'
import { DatabaseService } from '../system/database/database.service'

@Injectable()
export class ProviderRequestsService {
    constructor(
        private prisma: DatabaseService,
        private uploadsLinkService: UploadsLinkService
    ) {}

    async create(auth: AuthInfoDto, { imageIds, proposalId, ...dto }: ProviderRequestCreateDto) {
        const profile = await this.prisma.profile.findUnique({ where: { userId: auth.id } })

        const providerRequest = await this.prisma.providerRequest.create({
            data: {
                ...dto,
                profileId: profile.id,
                horecaRequestId: proposalId,
            },
        })

        if (imageIds) {
            await this.uploadsLinkService.createMany(UploadsLinkType.ProviderRequest, providerRequest.id, imageIds)
        }

        return this.get(auth, providerRequest.id)
    }

    async get(auth: AuthInfoDto, id: number) {
        const providerRequest = await this.prisma.providerRequest.findUnique({
            where: { id },
        })

        const images = await this.uploadsLinkService.getImages(UploadsLinkType.ProviderRequest, [providerRequest.id])

        return new ProviderRequestDto({
            ...providerRequest,
            images: images[id].map(image => image.image),
        })
    }

    async approveByHoreca(auth: AuthInfoDto, id: number) {
        await this.prisma.providerRequest.update({
            where: { id },
            data: { approvedByHoreca: true },
        })
    }
}
