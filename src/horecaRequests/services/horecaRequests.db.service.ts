import { forwardRef, Inject, Injectable } from '@nestjs/common'
import { DatabaseService } from '../../system/database/database.service'
import { Prisma } from '@prisma/client'

@Injectable()
export class HorecaRequestsDbService {
    constructor(
        //@Inject(forwardRef(() => DatabaseService))
        private db: DatabaseService
    ) {}

    create = async (data: Prisma.HorecaRequestCreateInput) => {
        return this.db.horecaRequest.create({
            data,
        })
    }

    get = async (id: number) => {
        return this.db.horecaRequest.findUnique({
            where: { id },
            include: { items: true },
        })
    }

    findManyWithItems = async (args: Prisma.HorecaRequestFindManyArgs) => {
        return this.db.horecaRequest.findMany({ include: { items: true }, ...args })
    }
}
