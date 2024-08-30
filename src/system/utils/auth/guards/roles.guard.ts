import { CanActivate, ExecutionContext, ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common'
import { Reflector } from '@nestjs/core'

import { AuthInfoDto } from '../../../../users/dto/auth.info.dto'
import { ROLES_KEY } from '../decorators/roles.decorator'
import { UsersService } from '../../../../users/services/users.service'
import { UserRole } from '@prisma/client'
import { AuthorizationService } from '../../../../users/services/authorization.service'

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(
        private authService: AuthorizationService,
        private usersService: UsersService,
        private reflector: Reflector
    ) {}

    async canActivate(context: ExecutionContext) {
        const request = context.switchToHttp().getRequest()

        const token = request.headers?.authorization || request.handshake?.headers?.authorization

        if (!token) {
            throw new UnauthorizedException({ code: 401 })
        }

        const user = await this.getUserFromToken(token)

        const roles =
            this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [context.getHandler(), context.getClass()]) || []

        if (!roles.includes(user.role)) {
            throw new ForbiddenException()
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
