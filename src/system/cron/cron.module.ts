import { Global, Logger, Module } from '@nestjs/common'
import { CronPrismaService } from './cron.prisma.service'

@Global()
@Module({
    providers: [CronPrismaService, Logger],
    exports: [CronPrismaService],
})
export class CronModule {}
