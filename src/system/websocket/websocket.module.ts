import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { JwtModule } from '@nestjs/jwt'
import { WebsocketGateway } from './websocket.gateway'

@Module({
    imports: [
        JwtModule.registerAsync({
            imports: [ConfigModule],
            useFactory: async (configService: ConfigService) => ({
                secret: configService.get('JWT_ACCESS_TOKEN_SECRET'),
                signOptions: { expiresIn: '5m' },
            }),
            inject: [ConfigService],
        }),
        ConfigModule,
    ],
    providers: [WebsocketGateway],
    controllers: [],
    exports: [WebsocketGateway],
})
export class WebsocketModule {}
