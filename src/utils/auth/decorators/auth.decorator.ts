import { UseGuards, applyDecorators } from '@nestjs/common'

import { Roles } from './roles.decorator'
import { RolesGuard } from '../guards/roles.guard'
import { JwtAuthGuard } from '../guards/jwt.auth.guard'
import { UserRole } from '@prisma/client'
import { ApiBearerAuth } from '@nestjs/swagger'

export function AuthUser(...roles: UserRole[]) {
    return applyDecorators(ApiBearerAuth(), UseGuards(JwtAuthGuard), UseGuards(RolesGuard), Roles(...roles))
}


