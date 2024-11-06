import { Injectable } from '@nestjs/common'
import { AuthInfoDto } from '../users/dto/auth.info.dto'
import { ReviewCreateDto } from './dto/review.create.dto'
import { DatabaseService } from '../system/database/database.service'
import { ReviewDto } from './dto/review.dto'

@Injectable()
export class ReviewsService {
    constructor(
        private prisma: DatabaseService,
    ) {}

    async create(auth: AuthInfoDto, dto: ReviewCreateDto ) {
        const review = await this.prisma.providerRequestReview.create({
            data: {
                userId: auth.id,
                ...dto
            }
        })
        return new ReviewDto(review)
    }

    async sendReview() {
        // TODO
    }

}
