import { Module } from '@nestjs/common'
import { RequestsMatcherDbService } from './requestsMatcher.db.service'

@Module({
    providers: [RequestsMatcherDbService],
    exports: [RequestsMatcherDbService],
})
export class RequestsMatcherModule {}
