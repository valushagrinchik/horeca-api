import { Injectable } from '@nestjs/common'
import { Prisma } from '@prisma/client'
import { DatabaseService } from '../../system/database/database.service'

@Injectable()
export class ProviderRequestsDbService {
    constructor(private prisma: DatabaseService) {}

    getRawById = async (userId: number, id: number) => {
        return this.prisma.providerRequest.findUnique({
            where: { id, userId },
        })
    }

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
                horecaRequest: true,
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

    async count(args: Prisma.ProviderRequestCountArgs) {
        return this.prisma.providerRequest.count(args)
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
}
