import { Injectable } from '@nestjs/common'
import { Cron, CronExpression } from '@nestjs/schedule'
import { Queue } from 'bull'
import { InjectQueue } from '@nestjs/bull'
import { QUEUES } from '@/shared/utils'
@Injectable()
export class HorecaRequestsCronService {
    constructor(@InjectQueue(QUEUES.HORECA) private hQueue: Queue) {}

    @Cron(CronExpression.EVERY_HOUR)
    async processTasks(): Promise<void> {
        this.hQueue.add('pastRequests', {})
        this.hQueue.add('sendReviewNotification', {})
    }
}
