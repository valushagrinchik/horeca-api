import { createBullBoard } from '@bull-board/api'
import { BullAdapter } from '@bull-board/api/dist/src/queueAdapters/bull'
import { ExpressAdapter } from '@bull-board/express'
import { getQueueToken } from '@nestjs/bull'
import { INestApplication } from '@nestjs/common'
import { Queue } from 'bull'
import { QUEUES } from './constants'
import * as basicAuth from 'express-basic-auth'
import { ConfigService } from '@nestjs/config'

export const initBullDashboard = (app: INestApplication) => {
    const adapter = new ExpressAdapter()
    adapter.setBasePath('/queues')

    const horecaQueue = app.get<Queue>(getQueueToken(QUEUES.HORECA))

    const configService = app.get(ConfigService)
    const password = configService.get<string>('BULL_BOARD_PASSWORD')

    createBullBoard({
        queues: [new BullAdapter(horecaQueue)],
        serverAdapter: adapter,
    })

    app.use(
        '/queues',
        basicAuth({
            users: { admin: password },
            challenge: true,
        }),
        adapter.getRouter()
    )
}
