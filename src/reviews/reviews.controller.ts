import { Body, Controller, Post } from '@nestjs/common'
import { ApiOperation, ApiTags } from '@nestjs/swagger'
import { AuthUser, AuthParamDecorator } from '../auth/decorators'
import { UserRole } from '@prisma/client'
import { ReviewsService } from './reviews.service'
import { AuthInfoDto } from '../auth/dto/auth.info.dto'
import { ReviewDto } from './dto/review.dto'
import { RequestDecorator } from '@/shared/utils'
import { ReviewCreateDto } from './dto/review.create.dto'

@AuthUser(UserRole.Horeca)
@Controller('reviews/horeca')
@ApiTags('Reviews')
export class ReviewsController {
    constructor(private readonly service: ReviewsService) {}

    @Post()
    @RequestDecorator(ReviewDto, ReviewCreateDto)
    @ApiOperation({ summary: 'Создать отзыв на успешно завершенную сделку с поставщиком. Роль пользователя: Хорека' })
    async create(@AuthParamDecorator() auth: AuthInfoDto, @Body() dto: ReviewCreateDto) {
        return this.service.create(auth, dto)
    }
}
