import { ExecutionContext, createParamDecorator } from '@nestjs/common'
import { AuthInfoDto } from 'src/users/dto/auth.info.dto'

export const AuthParamDecorator = createParamDecorator((data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest()
    return request.user as AuthInfoDto
})
