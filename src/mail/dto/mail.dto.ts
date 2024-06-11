import { ApiProperty, PartialType } from '@nestjs/swagger'
import { Mail } from '@prisma/client'
import { IsEmail, IsNumber, IsObject, IsString } from 'class-validator'


export class MailDto implements Partial<Mail> {
    @ApiProperty({ default: 1 })
    @IsNumber()
    userId: number

    @ApiProperty({ default: 'test@gmail.com' })
    @IsString()
    to: string

    @ApiProperty({ default: 'Recover password' })
    @IsString()
    subject: string

    @ApiProperty({ default: 'password_recover' })
    @IsString()
    template: string

    @ApiProperty()
    @IsObject()
    context: object
}

export class UpdateMailDto extends PartialType(MailDto) {}

export class MailParamsDto {
    @ApiProperty({ default: 1 })
    @IsNumber()
    userId: number

    @ApiProperty({ default: 'test@gmail.com' })
    @IsEmail()
    email: string

    @ApiProperty({ default: 'test' })
    @IsEmail()
    username?: string

    @ApiProperty({ default: '' })
    @IsString()
    link?: string
}
