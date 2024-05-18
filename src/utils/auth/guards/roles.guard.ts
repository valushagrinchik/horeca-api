import { CanActivate, ExecutionContext, ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common'
import { Reflector } from '@nestjs/core'

import { AuthService } from 'src/users/auth.service'
import { AuthInfoDto } from 'src/users/dto/auth.info.dto'
import { ROLES_KEY } from '../decorators/roles.decorator'
import { UsersService } from 'src/users/users.service'
import { UserRole } from '@prisma/client'

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(
        private authService: AuthService,
        private usersService: UsersService,
        private reflector: Reflector
    ) {}

    async canActivate(context: ExecutionContext) {
        const request = context.switchToHttp().getRequest()
        const token = request.headers.authorization

        if (!token) {
            throw new UnauthorizedException({ code: 401 })
        }

        const user = await this.getUserFromToken(token)

        const roles = this.reflector.get<UserRole>(ROLES_KEY, context.getHandler())

        if (!roles.includes(user.role)) {
            throw new ForbiddenException({ code: 403 })
        }

        return true
    }

    private async getUserFromToken(token: string) {
        let auth: AuthInfoDto

        try {
            auth = this.authService.verifyRecoveryToken(token.replace('Bearer ', ''))
        } catch (e) {
            throw new UnauthorizedException({ code: 401 })
        }

        const user = await this.usersService.findByAuth(auth)

        if (!user) {
            throw new UnauthorizedException({ code: 401 })
        }

        return user
    }
}
