import { BadRequestException, Injectable } from '@nestjs/common'
import { RegistrateUserDto } from './dto/registrate-user.dto'
import { PrismaService } from '../prisma.service'
import { AuthInfoDto } from '../users/dto/auth.info.dto'
import { AuthorizationService } from './authorization.service'
import { LoginUserDto } from './dto/login-user.dto'
import { ErrorDto } from '../system/dto/error.dto'
import { ErrorCodeEnum } from '../system/error.code.enum'
import { UpdateUserDto } from './dto/update-user.dto'
import { UserDto } from './dto/user.dto'
import { MailService } from '../mail/mail.service'
import { User } from '@prisma/client'
import { validPassword } from '../system/crypto'

@Injectable()
export class UsersService {
    constructor(
        private prisma: PrismaService,
        private authService: AuthorizationService,
        private mailService?: MailService
    ) {}

    async registrate(dto: RegistrateUserDto) {
        if (!dto.GDPRApproved) {
            throw new BadRequestException(new ErrorDto(ErrorCodeEnum.GDPR_IS_NOT_APPROVED))
        }
        const user = await this.prisma.createUser(dto)

        // send activation link
        await this.mailService?.sendActivationMail({
            userId: user.id,
            username: user.name,
            email: user.email,
            link: user.activationLink,
        })

        return this.authService.login(user)
    }

    async activateAccount(uuid: string) {
        const user = await this.prisma.user.findFirst({ where: { activationLink: uuid } })
        if (!user) {
            throw new ErrorDto(ErrorCodeEnum.ACTIVATION_LINK_ERROR)
        }
        await this.activateUser(user)
    }

    async activateUser(user: User) {
        await this.prisma.user.update({
            where: { id: user.id },
            data: { isActivated: true },
        })
    }

    async update(auth: AuthInfoDto, dto: UpdateUserDto) {
        const user = await this.prisma.user.findUnique({
            where: { id: auth.id },
            include: { profile: { include: { addresses: true } } },
        })
        if (!user) {
            throw new BadRequestException(new ErrorDto(ErrorCodeEnum.USER_DOES_NOT_EXISTS))
        }

        const updated = await this.prisma.updateProfile(auth.id, dto)

        return new UserDto(updated)
    }

    async get(auth: AuthInfoDto): Promise<UserDto> {
        const user = await this.prisma.user.findUnique({
            where: { id: auth.id },
            include: { profile: { include: { addresses: true } } },
        })
        if (!user) {
            throw new BadRequestException(new ErrorDto(ErrorCodeEnum.AUTH_FAIL))
        }

        return new UserDto(user)
    }

    async login(dto: LoginUserDto) {
        const user = await this.prisma.user.findFirst({ where: { email: dto.email } })

        if (!user) {
            throw new BadRequestException(new ErrorDto(ErrorCodeEnum.AUTH_FAIL))
        }

        if (!validPassword(dto.password, user.password)) {
            throw new BadRequestException(new ErrorDto(ErrorCodeEnum.AUTH_FAIL))
        }

        return this.authService.login(user)
    }

    findByAuth(auth: AuthInfoDto) {
        return this.prisma.user.findFirst({
            where: { id: auth.id },
        })
    }
}
