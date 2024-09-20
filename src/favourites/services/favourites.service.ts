import { Injectable } from '@nestjs/common'
import { FavouritesDbService } from './favourites.db.service'
import { AuthInfoDto } from '../../users/dto/auth.info.dto'
import { FavouritesCreateDto } from '../dto/favourites.create.dto'

@Injectable()
export class FavouritesService {
    constructor(private readonly favsRep: FavouritesDbService) {}

    async create(auth: AuthInfoDto, dto: FavouritesCreateDto) {
        return this.favsRep.create(auth.id, dto)
    }
    async delete(auth: AuthInfoDto, providerId: number) {
        return this.favsRep.delete(auth.id, providerId)
    }
}
