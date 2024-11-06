import { Module } from '@nestjs/common'
import { UsersModule } from '../users/users.module'
import { ReviewsService } from './reviews.service'
import { ReviewsController } from './reviews.controller'

@Module({
    imports: [UsersModule],
    controllers: [ReviewsController],
    providers: [ReviewsService],
})
export class ReviewsModule {}
