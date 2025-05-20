import { BadRequestException, Injectable } from '@nestjs/common'
import { AuthInfoDto } from '../auth/dto/auth.info.dto'
import { ReviewCreateDto } from './dto/review.create.dto'
import { DatabaseService } from '../system/database/database.service'
import { ReviewDto } from './dto/review.dto'
import { ProviderRequestsService } from '@/providerRequests/services/providerRequests.service'
import { ProviderRequestStatus } from '@prisma/client'
import { ErrorCodes, ErrorDto } from '@/shared/utils'

@Injectable()
export class ReviewsService {
    constructor(
        private prisma: DatabaseService,
        private providerRequestsService: ProviderRequestsService
    ) {}

    async create(auth: AuthInfoDto, dto: ReviewCreateDto) {
        const providerRequest = await this.providerRequestsService.get(dto.providerRequestId)
        if (providerRequest.status != ProviderRequestStatus.Finished) {
            throw new BadRequestException(
                new ErrorDto(ErrorCodes.FORBIDDEN_ACTION, ['Incorrect provider request status'])
            )
        }
        const review = await this.prisma.providerRequestReview.create({
            data: {
                userId: auth.id,
                ...dto,
            },
        })
        return new ReviewDto(review)
    }

    async sendReview() {
        // TODO
    }
}
