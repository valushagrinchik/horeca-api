import { Injectable } from '@nestjs/common'

import { AuthInfoDto } from '../../users/dto/auth.info.dto'
import { SupportRequestCreateDto } from '../dto/supportRequest.create.dto'
import { SupportRequestsDbService } from './supportRequests.db.service'

@Injectable()
export class SupportRequestsService {
    constructor(private supportRequestsRep: SupportRequestsDbService) {}

    async create(auth: AuthInfoDto, dto: SupportRequestCreateDto) {
        return this.supportRequestsRep.create(auth, dto)
    }

    async resolve(auth: AuthInfoDto, id: number) {
        await this.supportRequestsRep.resolve(auth, id)
    }

    async assignAdmin(auth: AuthInfoDto, supportRequestsId: number) {
        await this.supportRequestsRep.assignAdmin(auth, supportRequestsId)
    }

    async isReadyForChat(auth: AuthInfoDto, id: number) {
        const request = await this.supportRequestsRep.get(auth, id)
        return !!request
    }
}
