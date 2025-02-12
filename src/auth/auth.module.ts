import { Logger, Module } from '@nestjs/common'
import { UsersModule } from '../users/users.module'
import { JwtStrategy } from './jwtStrategy'

@Module({
    imports: [UsersModule],
    controllers: [],
    providers: [JwtStrategy, Logger],
    exports: [JwtStrategy],
})
export class AuthModule {}
