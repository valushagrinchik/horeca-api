import { Injectable } from '@nestjs/common'
import { FavouritesDbService } from './favourites.db.service'
import { AuthInfoDto } from '../../users/dto/auth.info.dto'
import { FavouritesCreateDto } from '../dto/favourites.create.dto'
import { ChatType } from '@prisma/client'
import { ChatService } from 'src/chat/services/chat.service'

@Injectable()
export class FavouritesService {
    constructor(
        private favsRep: FavouritesDbService,
        private chatService: ChatService
    ) {}

    async create(auth: AuthInfoDto, dto: FavouritesCreateDto) {
        const fav = await this.favsRep.create(auth.id, dto)
        await this.chatService.createChat(auth, {
            sourceId: fav.id,
            type: ChatType.Private,
            opponentId: dto.providerId,
        })
        return fav
    }

    async delete(auth: AuthInfoDto, providerId: number) {
        const fav = await this.favsRep.delete(auth.id, providerId)
        await this.chatService.deactivate(auth, {
            sourceId: fav.id,
            type: ChatType.Private,
        })
    }
}
