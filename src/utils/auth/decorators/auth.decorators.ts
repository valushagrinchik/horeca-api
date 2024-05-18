import { UseGuards, applyDecorators } from '@nestjs/common'

import { Roles } from './roles.decorator'
import { RolesGuard } from '../guards/roles.guard'
import { JwtAuthGuard } from '../guards/jwt.auth.guard'
import { UserRole } from '@prisma/client'

export function AuthUser(type: UserRole) {
    let arr = []

    switch (type) {
        case UserRole.Provider:
            arr = [ UseGuards(JwtAuthGuard, RolesGuard), Roles(UserRole.Provider) ]
            break
        case UserRole.Horeca:
            arr = [ UseGuards(JwtAuthGuard, RolesGuard), Roles(UserRole.Horeca) ]
            break
        case UserRole.Admin:
            arr = [ UseGuards(JwtAuthGuard, RolesGuard) ]
            break
    }

    return applyDecorators(...arr)
}
