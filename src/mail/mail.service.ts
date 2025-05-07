import * as fs from 'fs'
import { join } from 'path'

import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { MailerService } from '@nestjs-modules/mailer'
import * as hbs from 'hbs'

import { MailDto, MailParamsDto } from './dto/mail.dto'
import { CronTask, Mail } from '@prisma/client'
import { DatabaseService } from '../system/database/database.service'

@Injectable()
export class MailService {
    constructor(
        private configService: ConfigService,
        private readonly mailerService: MailerService,
        private prisma: DatabaseService,
        private readonly logger: Logger = new Logger(MailService.name)
    ) {}

    /**
     * Create mail in db
     * @param auth
     * @param dto
     * @returns
     */
    async create(userId: number, dto: MailDto) {
        return this.prisma.cronTask.create({ data: { mail: { create: dto } } })
    }

    /**
     * Direct mail sending
     * @param id
     */
    async sendMailById(id: number) {
        const cron = await this.prisma.cronTask.findUnique({ where: { id } })
        await this.sendMail(cron)
    }

    /**
     * Send mail and save message to log
     * @param mail
     * @returns
     */
    async sendMail(cron: CronTask): Promise<number | undefined> {
        const mail = await this.prisma.mail.findUnique({ where: { cronId: cron.id } })

        const { id: mailId, to, template, subject, context } = mail

        const templateFile: string = join(__dirname, 'templates', `${template}.hbs`)

        if (!fs.existsSync(templateFile)) {
            throw new Error(`Template not found: ${templateFile}`)
        }

        this.logger.log(`Send ${subject} mail to ${to} from ${this.configService.get(`SMTP_USER`)}`)

        const res = await this.mailerService.sendMail({
            from: `Сфера HoReCa ${this.configService.get(`SMTP_USER`)}`,
            to,
            subject,
            template,
            context: context as Record<string, any>,
        })

        //get mail text and save message to log
        const templateText: string = fs.readFileSync(templateFile, 'utf8').toString()
        const htmlTemplate = hbs.handlebars.compile(templateText)
        const message: string = htmlTemplate(context)

        const mailLog = await this.prisma.mailLog.create({
            data: {
                mailId,
                message,
            },
        })
        return mailLog?.id
    }

    /**
     * Send activvation link
     * @returns
     */
    async sendActivationMail({ userId, username, email, link }: MailParamsDto) {
        return await this.create(userId, {
            userId,
            to: email,
            subject: 'Подтверждение адреса электронной почты',
            template: 'confirmation',
            context: {
                username,
                link: `${this.configService.get('FRONTEND_URL')}/account/activation/${link}`,
                service: 'HoReCa',
            },
        })
    }

    /**
     * Send password recovery
     * @returns
     */
    async sendRecoveryPass({ userId, email, link }: MailParamsDto) {
        return await this.create(userId, {
            userId,
            to: email,
            subject: 'Запрос на восстановление пароля',
            template: 'password_recovery',
            context: {
                link: `${this.configService.get('FRONTEND_URL')}/account/password_recovery/${link}`,
                service: 'HoReCa',
            },
        })
    }

    /**
     * Send password changed
     * @returns
     */
    async sendPassChanged({ userId, email }: MailParamsDto) {
        return await this.create(userId, {
            userId,
            to: email,
            subject: 'Ваш пароль успешно изменён',
            template: 'password_changed',
            context: {
                link: `${this.configService.get('FRONTEND_URL')}/sign-in`,
                service: 'HoReCa',
            },
        })
    }
}
