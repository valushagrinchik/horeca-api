import { Injectable } from '@nestjs/common'

import { DatabaseService } from '../../system/database/database.service'
import { AuthInfoDto } from '../../users/dto/auth.info.dto'
import { SupportRequestCreateDto } from '../dto/supportRequest.create.dto'
import { Prisma, SupportRequestStatus } from '@prisma/client'

@Injectable()
export class SupportRequestsDbService {
    constructor(private db: DatabaseService) {}

    // auth by Horeca or Provider
    async create(auth: AuthInfoDto, dto: SupportRequestCreateDto) {
        return this.db.supportRequest.create({
            data: {
                ...dto,
                userId: auth.id,
            },
        })
    }

    // auth by Admin
    async get(auth: AuthInfoDto, id: number) {
        return this.db.supportRequest.findUnique({
            where: {
                id,
                adminId: auth.id,
            },
        })
    }

    async getById(id: number) {
        return this.db.supportRequest.findUnique({
            where: {
                id,
            },
        })
    }

    // auth by Horeca or Provider
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

    // auth by Admin
    async assignAdmin(auth: AuthInfoDto, id: number) {
        return this.db.supportRequest.update({
            where: {
                id,
            },
            data: {
                status: SupportRequestStatus.Active,
                adminId: auth.id,
            },
        })
    }

    async findMany(args: Prisma.SupportRequestFindManyArgs) {
        return this.db.supportRequest.findMany(args)
    }

    async count(args: Prisma.SupportRequestCountArgs) {
        return this.db.supportRequest.count(args)
    }
}
