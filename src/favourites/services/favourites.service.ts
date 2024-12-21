import { Injectable } from '@nestjs/common'
import { FavouritesDbService } from './favourites.db.service'
import { AuthInfoDto } from '../../users/dto/auth.info.dto'
import { FavouritesCreateDto } from '../dto/favourites.create.dto'
import { PaginateValidateType } from '../../system/utils/swagger/decorators'
import { FavouritesDto, FavouritesUserDto } from '../dto/favourites.dto'
import { NotificationWsGateway } from '../../notifications/notification.ws.gateway'
import { NotificationEvents } from '../../system/utils/enums/websocketEvents.enum'
import { Roles } from 'src/system/utils/auth/decorators/roles.decorator'
import { UserRole } from '@prisma/client'

@Injectable()
export class FavouritesService {
    constructor(
        private readonly favsRep: FavouritesDbService,
        private notificationWsGateway: NotificationWsGateway
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

    async findAllAndCount(auth: AuthInfoDto, paginate: PaginateValidateType): Promise<[FavouritesDto[], number]> {
        const where = auth.role == UserRole.Horeca ? { userId: auth.id } : { providerId: auth.id }
        const data = await this.favsRep.findAll({
            where,
            include: {
                user: { select: { name: true } },
                provider: { select: { name: true } },
            },
            orderBy: {
                createdAt: 'desc',
                [paginate.sort.field]: paginate.sort.order,
            },
            take: paginate.limit,
            skip: paginate.offset,
        })
        const total = await this.favsRep.count({ where })

        return [
            data.map(
                (f: any) =>
                    new FavouritesDto({
                        ...f,
                        user: new FavouritesUserDto(f.user),
                        provider: new FavouritesUserDto(f.provider),
                    })
            ),
            total,
        ]
    }
}
