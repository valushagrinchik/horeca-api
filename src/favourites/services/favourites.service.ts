import { Injectable } from '@nestjs/common'
import { FavouritesDbService } from './favourites.db.service'
import { AuthInfoDto } from '../../users/dto/auth.info.dto'
import { FavouritesCreateDto } from '../dto/favourites.create.dto'
import { PaginateValidateType } from '../../system/utils/swagger/decorators'
import { FavouritesDto } from '../dto/favourites.dto'

@Injectable()
export class FavouritesService {
    constructor(private readonly favsRep: FavouritesDbService) {}

    async create(auth: AuthInfoDto, dto: FavouritesCreateDto) {
        return this.favsRep.create(auth.id, dto)
    }

    async delete(auth: AuthInfoDto, providerId: number) {
        return this.favsRep.delete(auth.id, providerId)
    }

    async isReadyForChat(auth: AuthInfoDto, providerId: number) {
        const request = await this.favsRep.find({ userId: auth.id, providerId })
        return !!request
    }

    async findAllAndCount(auth: AuthInfoDto, paginate: PaginateValidateType): Promise<[FavouritesDto[], number]> {
        const where = { userId: auth.id }
        const data = await this.favsRep.findAll({
            where,
            orderBy: {
                createdAt: 'desc',
                [paginate.sort.field]: paginate.sort.order,
            },
            take: paginate.limit,
            skip: paginate.offset,
        })
        const total = await this.favsRep.count({ where })

        return [data.map(f => new FavouritesDto(f)), total]
    }
}
