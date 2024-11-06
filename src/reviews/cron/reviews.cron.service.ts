import { Injectable } from '@nestjs/common'
import { Cron, CronExpression } from '@nestjs/schedule'
import { CronPrismaService } from '../../system/cron/cron.prisma.service'
import { ReviewsService } from '../reviews.service'

@Injectable()
export class ReviewsCronService {
    constructor(
        private cron: CronPrismaService,
        private readonly service: ReviewsService
    ) {}

    onModuleInit(): void {
        void this.processTasks()
    }

    @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
    async processTasks(): Promise<void> {
        await this.cron.processTasks(this.service, 'sendReview')
    }
}
