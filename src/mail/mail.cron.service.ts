import { Injectable } from '@nestjs/common'
import { Cron, CronExpression } from '@nestjs/schedule'
import { MailService } from './mail.service'
import { CronPrismaService } from '../system/cron/cron.prisma.service'

@Injectable()
export class MailCronService {
    constructor(
        private cron: CronPrismaService,
        private readonly mailService: MailService
    ) {}

    onModuleInit(): void {
        void this.processMailTasks()
    }

    @Cron(CronExpression.EVERY_30_SECONDS)
    async processMailTasks(): Promise<void> {
        await this.cron.processTasks(this.mailService, 'sendMail')
    }
}
