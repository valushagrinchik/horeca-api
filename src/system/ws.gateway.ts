import { JwtService } from '@nestjs/jwt'
import { OnGatewayConnection, OnGatewayDisconnect, WebSocketServer } from '@nestjs/websockets'
import { Server, Socket } from 'socket.io'

import { ConfigService } from '@nestjs/config'
import { OnModuleInit } from '@nestjs/common'

export class WsGateway<E, P> implements OnModuleInit, OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer() server: Server
    protected clients: { userId: number; client: Socket }[] = []

    constructor(
        protected jwtService: JwtService,
        protected configService: ConfigService
    ) {}

    onModuleInit() {
        this.server.on('error', error => {
            console.log(error, 'error!!!')
        })
    }

    async handleConnection(client: Socket) {
        try {
            if (typeof client.handshake.auth.authorization === 'string') {
                const payload = this.jwtService.verify(client.handshake.auth.authorization.replace('Bearer ', ''), {
                    secret: this.configService.get('JWT_ACCESS_TOKEN_SECRET'),
                })

                client = Object.assign(client, {
                    auth: payload,
                })
                this.clients.push({ userId: payload.id, client })
            } else {
                client.disconnect()
            }
        } catch (error) {
            client.disconnect()
        }
    }

    handleDisconnect(client: Socket) {
        this.clients = this.clients.filter(data => data.client !== client)
    }

    public sendTo(userId: number, event: E, payload: P) {
        const connected = this.clients.find(client => client.userId == userId)
        if (connected) {
            connected.client.emit(event as string, payload)
        }
    }
}
