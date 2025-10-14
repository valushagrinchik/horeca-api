import { Process, Processor } from '@nestjs/bull'
import { QUEUES } from '@/shared/utils'
import { Job } from 'bull'
import { HorecaRequestsService } from '../services/horecaRequests.service'
import { RequestsMatcherDbService } from '@/shared/requestsMatcher/requestsMatcher.db.service'

@Processor(QUEUES.HORECA)
export class HorecaRequestsConsumerService {
    constructor(
        private hrService: HorecaRequestsService,
        private requestsMatcherService: RequestsMatcherDbService,
    ) { }

    @Process('pastRequests')
    async pastRequests(job: Job<unknown>) {
        return this.hrService.pastRequests()
    }

    @Process('sendReviewNotification')
    async sendReviewNotification(job: Job<unknown>) {
        return this.hrService.sendReviewNotification()
    }

    @Process('updateProviderHorecaRequestsCoverView')
    async updateProviderHorecaRequestsCoverView(job: Job<unknown>) {
        return this.requestsMatcherService.updateView()
    }

    @Process('sendNotificationToAllMatchedProviders')
    async sendNotificationToAllMatchedProviders(job: Job<{ horecaRequestId: string }>) {
        return this.hrService.sendNotificationToAllMatchedProviders(+job.data.horecaRequestId)
    }
}
