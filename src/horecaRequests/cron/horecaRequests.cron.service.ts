import { Injectable } from '@nestjs/common'
import { Cron, CronExpression } from '@nestjs/schedule'
import { CronPrismaService } from '../../system/cron/cron.prisma.service'
import { HorecaRequestsService } from '../services/horecaRequests.service'

@Injectable()
export class HorecaRequestsCronService {
    constructor(
        private cron: CronPrismaService,
        private readonly service: HorecaRequestsService
    ) {}

    onModuleInit(): void {
        this.processTasks()
    }

    @Cron(CronExpression.EVERY_HOUR)
    async processTasks(): Promise<void> {
        await this.cron.processTasks(this.service, 'pastRequests')
        await this.cron.processTasks(this.service, 'sendReviewNotification')
    }
}
