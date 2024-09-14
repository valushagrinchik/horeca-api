import { BadRequestException, Injectable } from '@nestjs/common'
import { RegistrateUserDto } from '../dto/registrate-user.dto'
import { AuthInfoDto } from '../dto/auth.info.dto'
import { AuthorizationService } from './authorization.service'
import { LoginUserDto } from '../dto/login-user.dto'
import { ErrorDto } from '../../system/utils/dto/error.dto'
import { ErrorCodes } from '../../system/utils/enums/errorCodes.enum'
import { UpdateUserDto } from '../dto/update-user.dto'
import { UserDto } from '../dto/user.dto'
import { MailService } from '../../mail/mail.service'
import { User } from '@prisma/client'
import { validPassword } from '../../system/crypto'
import { UsersDbService } from './users.db.service'

@Injectable()
export class UsersService {
    constructor(
        private usersRep: UsersDbService,
        private authService: AuthorizationService,
        private mailService?: MailService,
    ) {}

    async registrate(dto: RegistrateUserDto) {
        if (!dto.GDPRApproved) {
            throw new BadRequestException(new ErrorDto(ErrorCodes.GDPR_IS_NOT_APPROVED))
        }
        const user = await this.usersRep.createUser(dto)

        // send activation link
        await this.mailService?.sendActivationMail({
            userId: user.id,
            username: user.name,
            email: user.email,
            link: user.activationLink,
        })

        return new UserDto(user)
    }

    async activateAccount(uuid: string) {
        const user = await this.usersRep.getUserByActivationLink(uuid)  
        if (!user) {
            throw new ErrorDto(ErrorCodes.ACTIVATION_LINK_ERROR)
        }
        await this.activateUser(user)
    }

    async activateUser(user: User) {
        await this.usersRep.updateUser(user.id, { isActivated: true })
    }

    async update(auth: AuthInfoDto, dto: UpdateUserDto) {
        const user = await this.usersRep.getUserWithProfile( auth.id )
        if (!user) {
            throw new BadRequestException(new ErrorDto(ErrorCodes.USER_DOES_NOT_EXISTS))
        }

        const updated = await this.usersRep.updateProfile(auth.id, dto)

        return new UserDto(updated)
    }

    async get(auth: AuthInfoDto): Promise<UserDto> {
        const user = await this.usersRep.getUserWithProfile( auth.id )

        if (!user) {
            throw new BadRequestException(new ErrorDto(ErrorCodes.AUTH_FAIL))
        }

        return new UserDto(user)
    }

    async login(dto: LoginUserDto) {
        const user = await this.usersRep.getUserByEmail( dto.email )

        if (!user?.isActivated) {
            throw new BadRequestException(new ErrorDto(ErrorCodes.AUTH_FAIL))
        }

        if (!validPassword(dto.password, user.password)) {
            throw new BadRequestException(new ErrorDto(ErrorCodes.AUTH_FAIL))
        }

        return this.authService.login(user)
    }

    findByAuth(auth: AuthInfoDto) {
        return this.usersRep.getUser(auth.id)
    }
}
