import { Injectable } from '@nestjs/common'

import { AuthInfoDto } from '../../users/dto/auth.info.dto'
import { UploadsLinkType } from '@prisma/client'
import { ProviderRequestCreateDto } from '../dto/providerRequest.create.dto'
import { ProviderRequestDto } from '../dto/providerRequest.dto'
import { UploadsLinkService } from '../../uploads/uploads.link.service'
import { ProviderRequestsDbService } from './providerRequests.db.service'
import { ProviderRequestItemDto } from '../dto/providerRequestItem.dto'

@Injectable()
export class ProviderRequestsService {
    constructor(
        private providerRequestsRep: ProviderRequestsDbService,
        private uploadsLinkService: UploadsLinkService
    ) {}

    async create(auth: AuthInfoDto, { horecaRequestId, items, ...dto }: ProviderRequestCreateDto) {
        const providerRequest = await this.providerRequestsRep.create({
            ...dto,
            user: { connect: { id: auth.id } },
            horecaRequest: { connect: { id: horecaRequestId } },
            items: {
                createMany: {
                    data: items,
                },
            },
        })

        const itemIdsMap = new Map(providerRequest.items.map(item => [item.horecaRequestItemId, item.id]))

        Promise.all(
            items
                .filter(item => item.imageIds)
                .map(item =>
                    this.uploadsLinkService.createMany(
                        UploadsLinkType.ProviderRequestItem,
                        itemIdsMap[item.horecaRequestItemId],
                        item.imageIds
                    )
                )
        )

        return this.get(auth, providerRequest.id)
    }

    async get(auth: AuthInfoDto, id: number) {
        const providerRequest = await this.providerRequestsRep.get(id)

        const images = await this.uploadsLinkService.getImages(
            UploadsLinkType.ProviderRequestItem,
            providerRequest.items.map(item => item.id)
        )

        return new ProviderRequestDto({
            ...providerRequest,
            items: providerRequest.items.map(item => {
                return new ProviderRequestItemDto({ ...item, images: (images[id] || []).map(image => image.image) })
            }),
        })
    }

    async approveByHoreca(auth: AuthInfoDto, id: number) {
        await this.providerRequestsRep.update(id, { approvedByHoreca: true })
    }
}
