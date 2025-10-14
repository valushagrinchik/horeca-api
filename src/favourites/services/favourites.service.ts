import { Injectable } from '@nestjs/common'
import { FavouritesDbService } from './favourites.db.service'
import { AuthInfoDto } from '../../auth/dto/auth.info.dto'
import { FavouritesCreateDto } from '../dto/favourites.create.dto'
import { FavouritesDto, FavouritesUserDto } from '../dto/favourites.dto'
import { NotificationWsGateway } from '../../notifications/notification.ws.gateway'
import { NotificationEvents, PaginateValidateType, ProviderUserDto } from '@/shared/utils'
import { UploadsLinkType, UserRole } from '@prisma/client'
import { UploadsLinkService } from '@/uploads/uploads.link.service'

@Injectable()
export class FavouritesService {
    constructor(
        private readonly favsRep: FavouritesDbService,
        private uploadsLinkService: UploadsLinkService
    ) { }

    async create(auth: AuthInfoDto, dto: FavouritesCreateDto) {
        return this.favsRep.create(auth.id, dto)
    }

    async delete(auth: AuthInfoDto, providerId: number) {
        return this.favsRep.delete(auth.id, providerId)
    }

    // Horeca creates Private chat, Admin creates Support chat, Horeca creates Order chat
    async isReadyForChat(auth: AuthInfoDto, { id, providerId }: { providerId: number; id: number }) {
        const request = await this.favsRep.find({ userId: auth.id, providerId, id })
        return request
    }

    async findAllAndCount(
        auth: AuthInfoDto,
        paginate: PaginateValidateType<Object>
    ): Promise<[FavouritesDto[], number]> {
        const where = auth.role == UserRole.Horeca ? { userId: auth.id } : { providerId: auth.id }
        const data = await this.favsRep.findAll({
            where,
            select: {
                userId: true,
                providerId: true,
                chatId: true,
                createdAt: true,
                updatedAt: true,
                user: { select: { name: true, profile: { select: { id: true } } } },
                provider: { select: { profile: { select: { id: true, categories: true } }, rating: true, name: true } },
            },
            orderBy: {
                createdAt: 'desc',
                [paginate.sort.field]: paginate.sort.order,
            },
            take: paginate.limit,
            skip: paginate.offset,
        })
        const total = await this.favsRep.count({ where })

        const profilesIds = [
            ...data.map(f => (f as any).user.profile?.id),
            ...data.map(f => (f as any).provider.profile?.id),
        ].filter(el => !!el)

        const profilesImages = await this.uploadsLinkService.getImages(UploadsLinkType.Profile, profilesIds)

        return [
            data.map(
                ({
                    provider: { profile: providerProfile, ...providerData },
                    user: { profile: userProfile, ...userData },
                    ...favData
                }: any) =>
                    new FavouritesDto({
                        ...favData,
                        user: new FavouritesUserDto({
                            ...userData,
                            avatar: (profilesImages[userProfile?.id] || [])[0],
                        }),
                        provider: new ProviderUserDto({
                            ...providerData,
                            categories: providerProfile.categories,
                            avatar: (profilesImages[providerProfile?.id] || [])[0],
                        }),
                    })
            ),
            total,
        ]
    }
}
