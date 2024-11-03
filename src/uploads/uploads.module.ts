import { Module } from '@nestjs/common'
import { UploadsController } from './uploads.controller'
import { UploadsService } from './uploads.service'
import { MulterModule } from '@nestjs/platform-express'
import { UsersModule } from '../users/users.module'
import { UploadsLinkService } from './uploads.link.service'
import { diskStorage } from 'multer'
import { extname } from 'path'

@Module({
    imports: [
        MulterModule.register({
            storage: diskStorage({
                destination: (req, file, cb) => {
                    cb(null, 'uploads/')
                },

                filename: (req, file, cb) => {
                    const ext = extname(file.originalname)
                    const filename = `${Date.now()}${ext}`
                    cb(null, filename)
                },
            }),
            fileFilter: (req, file, cb) => {
                if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
                    cb(null, true)
                } else {
                    cb(new Error('Only images are allowed...'), false)
                }
            },
        }),
        UsersModule,
    ],
    controllers: [UploadsController],
    providers: [UploadsService, UploadsLinkService],
    exports: [UploadsLinkService],
})
export class UploadsModule {}
