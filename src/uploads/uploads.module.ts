import { forwardRef, Module } from '@nestjs/common'
import { UploadsController } from './uploads.controller'
import { UploadsService } from './uploads.service'
import { MulterModule } from '@nestjs/platform-express'
import { UploadsLinkService } from './uploads.link.service'
import { diskStorage } from 'multer'
import { extname } from 'path'
import { ChatModule } from '../chat/chat.module'
import { UploadsChatController } from './uploads.chat.controller'
import * as fs from 'fs'

@Module({
    imports: [
     
        ChatModule,
        MulterModule.register({
            storage: diskStorage({
                destination: (req, file, cb) => {          
                    const dir = `uploads/public/`
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
        }),
    ],
    controllers: [UploadsController, UploadsChatController],
    providers: [UploadsService, UploadsLinkService],
    exports: [UploadsLinkService],
})
export class UploadsModule {}
