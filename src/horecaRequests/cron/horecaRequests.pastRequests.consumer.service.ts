import { Process, Processor } from '@nestjs/bull'
import { QUEUES } from '@/shared/utils'
import { Job } from 'bull'

@Processor(QUEUES.HORECA)
export class PastRequestsConsumer {
    @Process('pastRequests')
    async pastRequests(job: Job<unknown>) {}
}
