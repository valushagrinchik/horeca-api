import { Injectable } from '@nestjs/common'
import { FavouritesDbService } from './favourites.db.service'
import { AuthInfoDto } from '../../users/dto/auth.info.dto'
import { FavouriteCreateDto } from '../dto/favourite.create.dto'
import { ChatType } from '@prisma/client'
import { ChatService } from '../../chat/services/chat.service'
import { FavouriteDto } from '../dto/favourite.dto'
import { ChatDto } from '../../chat/dto/chat.dto'

@Injectable()
export class FavouritesService {
    constructor(
        private favsRep: FavouritesDbService,
        private chatService: ChatService
    ) {}

    async create(auth: AuthInfoDto, dto: FavouriteCreateDto) {
        const favourite = await this.favsRep.create(auth.id, dto)
        const chat = await this.chatService.createChat(auth, {
            sourceId: favourite.id,
            type: ChatType.Private,
            opponentId: dto.providerId,
        })
        return { favourite: new FavouriteDto(favourite), chat: new ChatDto(chat) }
    }

    async delete(auth: AuthInfoDto, providerId: number) {
        const fav = await this.favsRep.delete(auth.id, providerId)
        await this.chatService.deactivate(auth, {
            sourceId: fav.id,
            type: ChatType.Private,
        })
    }
}
