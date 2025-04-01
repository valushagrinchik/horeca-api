import { BadRequestException, Injectable } from '@nestjs/common'
import { RegistrateUserDto } from './dto/registrate-user.dto'
import { AuthInfoDto } from '../auth/dto/auth.info.dto'
import { ErrorDto } from '../system/utils/dto/error.dto'
import { ErrorCodes } from '../system/utils/enums/errorCodes.enum'
import { UpdateUserDto } from './dto/update-user.dto'
import { UserDto } from './dto/user.dto'
import { Prisma, ProfileType, UploadsLinkType } from '@prisma/client'
import { UsersDbService } from './users.db.service'
import { RequestsMatcherDbService } from '../system/shared/requestsMatcher/requestsMatcher.db.service'
import { UploadsLinkService } from '../uploads/uploads.link.service'
import { PaginateValidateType } from '../system/utils/swagger/decorators'
import { UsersSearchAdminDto } from './dto/usersSearch.admin.dto'
import { ChangePasswordDto } from './dto/change-password.dto'

@Injectable()
export class UsersService {
    constructor(
        private usersRep: UsersDbService,
        private requestsMatcherService: RequestsMatcherDbService,
        private uploadsLinkService: UploadsLinkService
    ) {}

    async create(dto: RegistrateUserDto) {
        const user = await this.usersRep.createUser(dto)
        if (dto.profile.profileType == ProfileType.Provider) {
            this.requestsMatcherService.updateView()
        }
        return new UserDto(user)
    }

    async passwordChange(uuid: string, dto: ChangePasswordDto) {
        let user = await this.usersRep.getUserByActivationLink(uuid)
        if (!user) {
            throw new BadRequestException(new ErrorDto(ErrorCodes.ACTIVATION_LINK_ERROR))
        }
        user = await this.usersRep.updateUser(user.id, {password: dto.password})
        return user
    }

    async activate(uuid: string) {
        const user = await this.usersRep.getUserByActivationLink(uuid)
        if (!user) {
            throw new BadRequestException(new ErrorDto(ErrorCodes.ACTIVATION_LINK_ERROR))
        }
        await this.usersRep.updateUser(user.id, { isActivated: true })
    }

    async update(auth: AuthInfoDto, { avatar, ...dto }: UpdateUserDto) {
        const user = await this.usersRep.getUserWithProfile(auth.id)
        if (!user) {
            throw new BadRequestException(new ErrorDto(ErrorCodes.USER_DOES_NOT_EXISTS))
        }

        if (avatar) {
            await this.uploadsLinkService.deleteAllForSourceId(UploadsLinkType.Profile, user.profile.id)
            await this.uploadsLinkService.createMany(UploadsLinkType.Profile, user.profile.id, [avatar])
        }

        const updated = await this.usersRep.updateProfile(auth.id, dto)
        const images = await this.uploadsLinkService.getImages(UploadsLinkType.Profile, [user.id])

        return new UserDto({ ...updated, avatar: (images[user.id] || [])[0]?.image })
    }

    async get(auth: AuthInfoDto): Promise<UserDto> {
        const user = await this.usersRep.getUserWithProfile(auth.id)

        if (!user) {
            throw new BadRequestException(new ErrorDto(ErrorCodes.AUTH_FAIL))
        }

        const images = await this.uploadsLinkService.getImages(UploadsLinkType.Profile, [user.profile.id])

        return new UserDto({ ...user, avatar: (images[user.profile.id] || [])[0]?.image })
    }

    async findAllAndCount(
        auth: AuthInfoDto,
        paginate: PaginateValidateType<UsersSearchAdminDto>
    ): Promise<[UserDto[], number]> {
        const { role } = paginate.search
        const where: Prisma.UserWhereInput = {
            role,
        }
        const data = await this.usersRep.findMany({
            where,
            orderBy: {
                [paginate.sort.field]: paginate.sort.order,
            },
            take: paginate.limit,
            skip: paginate.offset,
            include: {
                profile: {
                    include: {
                        addresses: true,
                    }
                },
            },
        })
        const total = await this.usersRep.count({
            where,
        })
        return [data.map(r => new UserDto(r)), total]
    }

    getUserByEmail(email: string) {
        return this.usersRep.getUserByEmail(email)
    }

    getUserById(id: number) {
        return this.usersRep.getUser(id)
    }
}
