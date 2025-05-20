import { Module } from '@nestjs/common'
import { ReviewsService } from './reviews.service'
import { ReviewsController } from './reviews.controller'
import { AuthModule } from '../auth/auth.module'
import { ProviderRequestsModule } from '@/providerRequests/providerRequests.module'

@Module({
    imports: [ProviderRequestsModule],
    controllers: [ReviewsController],
    providers: [ReviewsService],
})
export class ReviewsModule {}
