import { Injectable } from '@nestjs/common'
import { DatabaseService } from '../../system/database/database.service'
import { HorecaRequestStatus, Prisma } from '@prisma/client'
import { HorecaRequestApproveProviderRequestDto } from '../dto/horecaRequest.approveProviderRequest.dto'
import * as dayjs from 'dayjs'
import { DB_DATE_FORMAT } from '../../system/utils/constants'

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

    count = async (args: Prisma.HorecaRequestCountArgs) => {
        return this.db.horecaRequest.count(args)
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
                status: HorecaRequestStatus.Active,
            },
        })
    }

    completePastRequests = async () => {
        const now = dayjs().format(DB_DATE_FORMAT)

        await this.db.horecaRequest.updateMany({
            where: {
                OR: [
                    {
                        AND: {
                            acceptUntill: { lt: now },
                            providerRequests: {
                                none: {},
                            },
                            status: {
                                in: [HorecaRequestStatus.WaitingForProviderRequests],
                            },
                        },
                    },
                    {
                        AND: {
                            deliveryTime: { lt: new Date(now) },
                            providerRequests: {
                                some: {},
                            },
                            status: {
                                in: [HorecaRequestStatus.WaitingForProviderRequests],
                            },
                        },
                    },
                ],
            },
            data: {
                status: HorecaRequestStatus.CompletedUnsuccessfully,
            },
        })

        await this.db.horecaRequest.updateMany({
            where: {
                AND: {
                    deliveryTime: { lt: now },
                    activeProviderRequest: {
                        isNot: null,
                    },
                    status: {
                        in: [HorecaRequestStatus.Active],
                    },
                },
            },
            data: {
                status: HorecaRequestStatus.CompletedSuccessfully,
            },
        })
    }
}
