import { forwardRef, Inject, Injectable } from '@nestjs/common'
import { DatabaseService } from '../../system/database/database.service'
import { Prisma } from '@prisma/client'

@Injectable()
export class HorecaRequestsTemplateDbService {
    constructor( //@Inject(forwardRef(() => DatabaseService)) 
    private db: DatabaseService) {}

    create = async (data: Prisma.HorecaRequestTemplateCreateInput) => {
        return this.db.horecaRequestTemplate.create({
            data,
        })
    }

    get = async (id: number) => {
        return this.db.horecaRequestTemplate.findUnique({
            where: {id},
        })
    }
}

