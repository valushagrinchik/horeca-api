import { BadRequestException, Injectable } from '@nestjs/common'

import { AuthInfoDto } from '../../users/dto/auth.info.dto'
import { SupportRequestCreateDto } from '../dto/supportRequest.create.dto'
import { SupportRequestsDbService } from './supportRequests.db.service'
import { ErrorDto } from 'src/system/utils/dto/error.dto'
import { ErrorCodes } from 'src/system/utils/enums/errorCodes.enum'

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
        const request = await this.supportRequestsRep.getById(supportRequestsId)
        if (request.adminId) {
            throw new BadRequestException(new ErrorDto(ErrorCodes.FORBIDDEN_ACTION, ['The Admin is already assigned']))
        }
        await this.supportRequestsRep.assignAdmin(auth, supportRequestsId)
    }

    async isReadyForChat(auth: AuthInfoDto, id: number) {
        const request = await this.supportRequestsRep.get(auth, id)
        return request
    }
}
