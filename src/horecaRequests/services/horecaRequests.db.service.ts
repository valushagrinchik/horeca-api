import { Injectable } from '@nestjs/common'
import { DatabaseService } from '../../system/database/database.service'
import { Prisma } from '@prisma/client'
import { HorecaRequestApproveProviderRequestDto } from '../dto/horecaRequest.approveProviderRequest.dto'

@Injectable()
export class HorecaRequestsDbService {
    constructor(private db: DatabaseService) {}

    create = async (data: Prisma.HorecaRequestCreateInput) => {
        return this.db.horecaRequest.create({
            data,
        })
    }

    get = async (userId: number, id: number) => {
        return this.db.horecaRequest.findUnique({
            where: { id, userId },
            include: { items: true, providerRequests: { include: { items: true } }, activeProviderRequest: true },
        })
    }

    findManyWithItems = async (args: Prisma.HorecaRequestFindManyArgs) => {
        return this.db.horecaRequest.findMany({ include: { items: true }, ...args })
    }

    approveProviderRequest = async (userId: number, dto: HorecaRequestApproveProviderRequestDto) => {
        return this.db.horecaRequest.update({
            where: {
                id: dto.horecaRequestId,
                userId,
            },
            data: {
                activeProviderRequest: {
                    connect: { id: dto.providerRequestId },
                },
            },
        })
    }
}
