import { Controller, Param, Post, UploadedFile, UseInterceptors, Get, Res } from '@nestjs/common'
import { Response } from 'express'
import { UploadsService } from './uploads.service'
import { FileInterceptor } from '@nestjs/platform-express/multer'
import { ApiBody, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger'
import { AuthParamDecorator, AuthUser } from '../auth/decorators'
import { UserRole } from '@prisma/client'
import { UploadDto } from './dto/upload.dto'
import { ChatService } from '@/chat/services/chat.service'
import { AuthInfoDto } from '@/auth/dto/auth.info.dto'
import { diskStorage } from 'multer'
import { extname } from 'path'
import * as fs from 'fs'
import { ErrorCodes } from '@/shared/utils'

@Controller('uploads/chat/:chatId')
@ApiTags('Uploads')
@AuthUser(UserRole.Provider, UserRole.Horeca, UserRole.Admin)
export class UploadsChatController {
    constructor(
        private readonly uploadsService: UploadsService,
        private readonly chatService: ChatService
    ) {}

    @Post()
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                file: {
                    type: 'string',
                    format: 'binary',
                },
            },
        },
    })
    @UseInterceptors(
        FileInterceptor('file', {
            storage: diskStorage({

                destination: (req, file, cb) => {
                    const chatId = req.params.chatId

                    
                    const dir = `uploads/private/chats/${chatId}/`
                    fs.promises.mkdir(dir, { recursive: true })
                    .catch((err) => {
                        if (err.code !== 'EEXIST') {
                            throw err
                        }
                    })
                    
                    cb(null, dir)
                },
                filename: (req, file, cb) => {
                    const ext = extname(file.originalname)
                    const filename = `${Date.now()}${ext}`
                    cb(null, filename)
                },
            }),
            limits: { fileSize: Math.pow(1024, 2) * 5 }, // 5MB limit for chat files
            fileFilter: (req, file, cb) => {
                // Allow images, documents, and common file types for chat
                const allowedMimes = [
                    'image/jpeg', 'image/png', 'image/gif', 'image/webp',
                    'application/pdf', 
                    'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                    'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                    'text/plain', 'text/csv'
                ]
                if (allowedMimes.includes(file.mimetype)) {
                    cb(null, true)
                } else {
                    cb(new Error(ErrorCodes.FILE_TYPE_NOT_ALLOWED_FOR_CHAT_UPLOADS), false)
                }
            }
        })
    )
    @ApiOperation({ summary: 'Загрузить файл для чата. Роль пользователя: Поставщик/Хорека/Админ' })
    async uploadForChat(@AuthParamDecorator() auth: AuthInfoDto, @UploadedFile() file: Express.Multer.File, @Param('chatId') chatId: number) {
        await this.chatService.validate(auth, chatId)
        const upload = await this.uploadsService.uploadForChat(file, chatId)
        return new UploadDto(upload, true)
    }


    @Get('upload/:uploadId')
    @ApiOperation({ summary: 'Получить файл для чата. Роль пользователя: Поставщик/Хорека/Админ' })
    async getImageForChat(@AuthParamDecorator() auth: AuthInfoDto, @Param('chatId') chatId: number, @Param('uploadId') uploadId: number, @Res() response: Response) {
        await this.chatService.validate(auth, chatId)
        const upload = await this.uploadsService.findOne(uploadId, chatId)
        
        console.log('Upload path:', upload.path) // Debug log
        console.log('File exists:', fs.existsSync(upload.path)) // Debug log
        
        const readStream = await this.uploadsService.readUpload(upload)
        
        // Set appropriate headers for file serving
        response.setHeader('Content-Type', upload.mimetype)
        response.setHeader('Content-Disposition', `inline; filename="${upload.name}"`)
        response.setHeader('Cache-Control', 'private, max-age=3600') // Cache for 1 hour
        response.setHeader('Content-Length', upload.size.toString())
        
        // Handle stream errors
        readStream.on('error', (error) => {
            console.error('Stream error:', error)
            response.status(500).send('File read error')
        })
        
        readStream.pipe(response)
    }
}
