import { BadRequestException, ForbiddenException, Injectable } from '@nestjs/common'
import { RegistrateUserDto } from './dto/registrate-user.dto'
import { PrismaService } from 'src/prisma.service'
import * as bcrypt from 'bcrypt'
import { AuthInfoDto } from 'src/users/dto/auth.info.dto'
import { AuthorizationService } from './authorization.service'
import { LoginUserDto } from './dto/login-user.dto'
import { ErrorDto } from 'src/utils/error.dto'
import { ErrorCodeEnum } from 'src/utils/error.code.enum'
import { UpdateUserDto } from './dto/update-user.dto'
import { UserDto } from './dto/user.dto'
import { MailService } from 'src/mail/mail.service'
@Injectable()
export class UsersService {
    constructor(
        private prisma: PrismaService,
        private authService: AuthorizationService,
        private mailService: MailService
    ) {}

    async registrate(dto: RegistrateUserDto) {
        if (!dto.GDPRApproved) {
            throw new BadRequestException(new ErrorDto(ErrorCodeEnum.GDPR_IS_NOT_APPROVED))
        }
        const user = await this.prisma.createUser(dto)

        // send activation link
        await this.mailService.sendActivationMail({
            userId: user.id,
            username: user.name,
            email: user.email,
            link: user.activationLink,
        })

        return this.authService.login(user)
    }

    async update(auth: AuthInfoDto, id: number, dto: UpdateUserDto) {
        if(auth.id !== id){
            throw new ForbiddenException()
        }
        const user = await this.prisma.user.findUnique({ where: { id }, include: { profile: { include: { addresses: true } } } })
        if (!user) {
            throw new BadRequestException(new ErrorDto(ErrorCodeEnum.USER_DOES_NOT_EXISTS))
        }

        const updated = await this.prisma.updateProfile(id, dto)

        return new UserDto(updated)
    }

    async get(auth: AuthInfoDto, id: number): Promise<UserDto> {
        if(auth.id !== id){
            throw new ForbiddenException()
        }
        const user = await this.prisma.user.findUnique({
            where: { id },
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

        const isPasswordValid = await bcrypt.compare(dto.password, user.password)
        if (!isPasswordValid) {
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
