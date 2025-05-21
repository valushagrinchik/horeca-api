import { Process, Processor } from '@nestjs/bull'
import { QUEUES } from '@/shared/utils'
import { Job } from 'bull'
import { HorecaRequestsService } from '../services/horecaRequests.service'

@Processor(QUEUES.HORECA)
export class HorecaRequestsConsumerService {
    constructor(private hrService: HorecaRequestsService) {}

    @Process('pastRequests')
    async pastRequests(job: Job<unknown>) {
        return this.hrService.pastRequests()
    }

    @Process('sendReviewNotification')
    async sendReviewNotification(job: Job<unknown>) {
        return this.hrService.sendReviewNotification()
    }
}
