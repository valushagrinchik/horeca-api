import { MailerService } from '@nestjs-modules/mailer'
import { initApp } from './helpers'
import { INestApplication } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'

let app: INestApplication
let mailer: MailerService
let config: ConfigService

beforeAll(async () => {
    app = await initApp(undefined, tm => {
        config = tm.get<ConfigService>(ConfigService)
        mailer = tm.get<MailerService>(MailerService)
    })
})

afterAll(async () => {
    await app.close()
})

describe('Sending email', () => {
    it('should send email', async () => {
        const to = config.get('TEST_MAIL_TO')
        const res = await mailer.sendMail({
            from: config.get('SUPPORT_MAIL'),
            to,
            subject: 'Confirm your email address',
            template: 'confirmation',
            context: {
                link: '/',
                service: 'HoReCa',
                username: 'we'
            }
        })

        expect(res).toHaveProperty('accepted')
        expect(res.accepted[0]).toBe(to)
        return
    })
})