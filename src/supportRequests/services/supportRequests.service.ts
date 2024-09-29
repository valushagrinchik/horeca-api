import { Injectable } from '@nestjs/common'

import { AuthInfoDto } from '../../users/dto/auth.info.dto'
import { SupportRequestCreateDto } from '../dto/supportRequest.create.dto'
import { SupportRequestsDbService } from './supportRequests.db.service'
import { ChatSupportService } from '../../chat/services/chat.support.service'
import { SupportRequestDto } from '../dto/supportRequest.dto'
import { ChatDto } from '../../chat/dto/chat.dto'

@Injectable()
export class SupportRequestsService {
    constructor(
        private supportRequestsRep: SupportRequestsDbService,
        private chatService: ChatSupportService
    ) {}

    async create(auth: AuthInfoDto, dto: SupportRequestCreateDto) {
        const supportRequest = await this.supportRequestsRep.create(auth, dto)
        const chat = await this.chatService.createChat(auth, supportRequest.id)
        return { supportRequest: new SupportRequestDto(supportRequest), chat: new ChatDto(chat) }
    }

    async resolve(auth: AuthInfoDto, id: number) {
        return this.supportRequestsRep.resolve(auth, id)
    }

    async assignAdmin(auth: AuthInfoDto, supportRequestsId: number) {
        await this.supportRequestsRep.assignAdmin(auth.id, supportRequestsId)
        await this.chatService.assignAdminToSupportChat(auth, supportRequestsId)
    }
}
