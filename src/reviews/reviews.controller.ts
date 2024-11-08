import { Body, Controller, Post } from '@nestjs/common'
import { ApiOperation, ApiTags } from '@nestjs/swagger'
import { AuthUser } from '../system/utils/auth/decorators/auth.decorator'
import { UserRole } from '@prisma/client'
import { ReviewsService } from './reviews.service'
import { AuthInfoDto } from '../users/dto/auth.info.dto'
import { AuthParamDecorator } from '../system/utils/auth/decorators/auth.param.decorator'
import { ReviewDto } from './dto/review.dto'
import { RequestDecorator } from '../system/utils/swagger/decorators'
import { ReviewCreateDto } from './dto/review.create.dto'

@AuthUser(UserRole.Horeca)
@Controller('reviews/horeca')
@ApiTags('Reviews')
export class ReviewsController {
    constructor(private readonly service: ReviewsService) {}

    @Post()
    @RequestDecorator(ReviewDto, ReviewCreateDto)
    @ApiOperation({ summary: 'Create review on succesfully finished provider request' })
    async create(@AuthParamDecorator() auth: AuthInfoDto, @Body() dto: ReviewCreateDto) {
        return this.service.create(auth, dto)
    }
}
