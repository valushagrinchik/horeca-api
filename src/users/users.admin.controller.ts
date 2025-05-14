import { Controller, Get } from '@nestjs/common'
import { UsersService } from './users.service'
import { ApiOperation, ApiTags } from '@nestjs/swagger'
import { UserDto } from './dto/user.dto'
import { AuthUser, AuthParamDecorator } from '../auth/decorators'
import { UserRole } from '@prisma/client'
import { AuthInfoDto } from '../auth/dto/auth.info.dto'
import {
    PaginateValidateType,
    RequestPaginatedDecorator,
    RequestPaginatedValidateParamsDecorator,
    PaginatedDto,
} from '@/shared/utils'
import { UsersSearchAdminDto } from './dto/usersSearch.admin.dto'

@Controller('admin/users')
@ApiTags('Users')
@AuthUser(UserRole.Provider, UserRole.Horeca, UserRole.Admin)
export class UsersAdminController {
    constructor(private readonly usersService: UsersService) {}

    @Get()
    @ApiOperation({ summary: 'Получить список пользователей. Роль пользователя: Админ' })
    @RequestPaginatedDecorator(UserDto, UsersSearchAdminDto)
    async get(
        @AuthParamDecorator() auth: AuthInfoDto,
        @RequestPaginatedValidateParamsDecorator<UsersSearchAdminDto>({ search: UsersSearchAdminDto })
        paginate: PaginateValidateType<UsersSearchAdminDto>
    ) {
        const [data, total] = await this.usersService.findAllAndCount(auth, paginate)
        return new PaginatedDto<UserDto>(data, total)
    }
}
