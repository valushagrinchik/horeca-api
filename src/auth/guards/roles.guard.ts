import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { ROLES_KEY } from '../decorators/roles.decorator'
import { UserRole } from '@prisma/client'

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private reflector: Reflector) {}

    async canActivate(context: ExecutionContext) {
        const request = context.switchToHttp().getRequest()

        const roles =
            this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [context.getHandler(), context.getClass()]) || []
        if (!roles.includes(request.user.role)) {
            throw new ForbiddenException()
        }
        return true
    }
}
