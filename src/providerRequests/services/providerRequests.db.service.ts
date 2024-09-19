import { Injectable } from '@nestjs/common'
import { Prisma } from '@prisma/client'
import { DatabaseService } from '../../system/database/database.service'

@Injectable()
export class ProviderRequestsDbService {
    constructor(private prisma: DatabaseService) {}

    async create(data: Prisma.ProviderRequestCreateInput) {
        return this.prisma.providerRequest.create({
            data,
            include: {
                items: true,
            },
        })
    }

    async get(id: number) {
        return this.prisma.providerRequest.findUnique({
            where: { id },
            include: {
                items: true,
            },
        })
    }

    async findAll(args: Prisma.ProviderRequestFindManyArgs) {
        return this.prisma.providerRequest.findMany({
            include: {
                items: true,
            },
            ...args,
        })
    }

    async update(id: number, data: Prisma.ProviderRequestUpdateInput) {
        await this.prisma.providerRequest.update({
            where: { id },
            data,
        })
    }

    async updateMany(where: Prisma.ProviderRequestWhereInput, data: Prisma.ProviderRequestUpdateInput) {
        await this.prisma.providerRequest.updateMany({
            where,
            data,
        })
    }

    async approveOnlyOne(id: number) {
        const currentProviderRequest = await this.get(id)
        await this.updateMany({ horecaRequestId: currentProviderRequest.horecaRequestId }, { approvedByHoreca: false })
        await this.update(id, { approvedByHoreca: true })
    }
}
