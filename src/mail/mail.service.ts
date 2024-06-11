import * as fs from 'fs'
import { join } from 'path'

import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { MailerService } from '@nestjs-modules/mailer'
import * as hbs from 'hbs'

import { MailDto, MailParamsDto } from './dto/mail.dto'
import { PrismaService } from 'src/prisma.service'
import { Mail } from '@prisma/client'

@Injectable()
export class MailService {

    constructor(
        private configService: ConfigService,
        private readonly mailerService: MailerService,
        private prisma: PrismaService,
        private readonly logger: Logger = new Logger(MailService.name)
    ) {}

    /**
     * Create mail in db
     * @param auth
     * @param dto
     * @returns
     */
    async create(userId: number, dto: MailDto): Promise<Mail> {
        return await this.prisma.mail.create({data: { ...dto, userId }})
    }

    /**
     * Direct mail sending
     * @param id
     */
    async sendMailById(id: number) {
        const mail = await this.prisma.mail.findUnique({ where: { id } })
        await this.sendMail(mail)
    }

    /**
     * Send mail and save message to log
     * @param mail
     * @returns
     */
    async sendMail(mail: Mail): Promise<number | undefined> {
        const { id: mailId, to, template, subject, context } = mail

        const templateFile: string = join(__dirname, 'templates', `${template}.hbs`)
        if (!fs.existsSync(templateFile)) {
            throw new Error('Template not found')
        }

        this.logger.log(`Send mail from ${this.configService.get(`SMTP_USER`)}`)
        await this.mailerService.sendMail({
            from: this.configService.get(`SMTP_USER`),
            to,
            subject,
            template,
            context: context as Record<string, any>
        })

        //get mail text and save message to log
        const templateText: string = fs.readFileSync(templateFile, 'utf8').toString()
        const htmlTemplate = hbs.handlebars.compile(templateText)
        const message: string = htmlTemplate(context)

        const mailLog = await this.prisma.mailLog.create({data: {
            mailId,
            message,
        }})
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
            subject: 'Confirm your email address',
            template: 'confirmation',
            context: {
                username,
                link: `${this.configService.get('BACKEND_URL')}/api/user/activate/${link}`,
                service: 'Crossnetics',
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
            subject: 'Reset your password',
            template: 'password_recovery',
            context: {
                link: `${this.configService.get('BACKEND_URL')}/api/user/recoveryPassword/${link}`,
                service: 'Crossnetics',
            },
        })
    }
}
