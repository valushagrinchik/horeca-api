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
        private notificationWsGateway: NotificationWsGateway,
        private uploadsLinkService: UploadsLinkService
    ) {}

    async create(auth: AuthInfoDto, dto: FavouritesCreateDto) {
        const fav = await this.favsRep.create(auth.id, dto)
        this.notificationWsGateway.sendNotification(dto.providerId, NotificationEvents.PROVIDER_ADDED_TO_FAVOURITES, {
            data: { horecaId: auth.id },
        })
        return fav
    }

    async delete(auth: AuthInfoDto, providerId: number) {
        const fav = this.favsRep.delete(auth.id, providerId)
        this.notificationWsGateway.sendNotification(providerId, NotificationEvents.PROVIDER_DELETED_FROM_FAVOURITES, {
            data: {
                horecaId: auth.id,
            },
        })
        return fav
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
                user: { select: { name: true } },
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

        const providerProfilesImage = await this.uploadsLinkService.getImages(
            UploadsLinkType.Profile,
            data.map(f => (f as any).provider.profile?.id).filter(el => !!el)
        )

        return [
            data.map(
                ({ provider: { profile, ...providerData }, ...favData }: any) =>
                    new FavouritesDto({
                        ...favData,
                        user: new FavouritesUserDto(favData.user),
                        provider: new ProviderUserDto({
                            ...providerData,
                            categories: profile.categories,
                            avatar: (providerProfilesImage[profile?.id] || [])[0],
                        }),
                    })
            ),
            total,
        ]
    }
}
