import { Injectable } from '@nestjs/common'

import { DatabaseService } from '../../system/database/database.service'
import { AuthInfoDto } from '../../users/dto/auth.info.dto'
import { SupportRequestCreateDto } from '../dto/supportRequest.create.dto'
import { Prisma, SupportRequestStatus } from '@prisma/client'

@Injectable()
export class SupportRequestsDbService {
    constructor(private db: DatabaseService) {}

    async create(auth: AuthInfoDto, dto: SupportRequestCreateDto) {
        return this.db.supportRequest.create({
            data: {
                ...dto,
                userId: auth.id,
            },
        })
    }

    async resolve(auth: AuthInfoDto, id: number) {
        return this.db.supportRequest.update({
            where: {
                userId: auth.id,
                id,
            },
            data: {
                status: SupportRequestStatus.Resolved,
            },
        })
    }

    async assignAdmin(adminId: number, id: number) {
        return this.db.supportRequest.update({
            where: {
                id,
            },
            data: {
                adminId,
            },
        })
    }
}
