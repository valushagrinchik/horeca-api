import { Injectable } from '@nestjs/common'
import { DatabaseService } from '../../system/database/database.service'
import { Prisma } from '@prisma/client'

@Injectable()
export class HorecaRequestsTemplateDbService {
    constructor(private db: DatabaseService) {}

    async create(data: Prisma.HorecaRequestTemplateCreateInput) {
        return this.db.horecaRequestTemplate.create({
            data,
        })
    }

    async find(where: Prisma.HorecaRequestTemplateWhereUniqueInput) {
        return this.db.horecaRequestTemplate.findUnique({
            where,
        })
    }

    async findAll(args: Prisma.HorecaRequestTemplateFindManyArgs) {
        return this.db.horecaRequestTemplate.findMany(args)
    }

    async count(args: Prisma.HorecaRequestTemplateCountArgs) {
        return this.db.horecaRequestTemplate.count(args)
    }

    async delete(args: Prisma.HorecaRequestTemplateDeleteArgs) {
        return this.db.horecaRequestTemplate.delete(args)
    }

    async update(args: Prisma.HorecaRequestTemplateUpdateArgs) {
        return this.db.horecaRequestTemplate.update(args)
    }
}
