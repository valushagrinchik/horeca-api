import { BadRequestException, Injectable } from '@nestjs/common'

import { AuthInfoDto } from '../../users/dto/auth.info.dto'
import { SupportRequestCreateDto } from '../dto/supportRequest.create.dto'
import { SupportRequestsDbService } from './supportRequests.db.service'
import { ErrorDto } from '../../system/utils/dto/error.dto'
import { ErrorCodes } from '../../system/utils/enums/errorCodes.enum'
import { PaginateValidateType } from '../../system/utils/swagger/decorators'
import { SupportRequestSearchDto } from '../dto/supportRequest.search.dto'
import { Prisma } from '@prisma/client'
import { SupportRequestDto } from '../dto/supportRequest.dto'

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

    async findAllAndCount(
        auth: AuthInfoDto,
        paginate: PaginateValidateType<SupportRequestSearchDto>
    ): Promise<[SupportRequestDto[], number]> {
        const { status, isNew } = paginate.search
        const where: Prisma.SupportRequestWhereInput = {
            status,
            ...(isNew ? { adminId: null } : {}),
        }
        const data = await this.supportRequestsRep.findMany({
            where,
            orderBy: {
                [paginate.sort.field]: paginate.sort.order,
            },
            take: paginate.limit,
            skip: paginate.offset,
        })
        const total = await this.supportRequestsRep.count({
            where,
        })
        return [data.map(r => new SupportRequestDto(r)), total]
    }
}
