import { Module } from '@nestjs/common'
import { UploadsController } from './uploads.controller'
import { UploadsService } from './uploads.service'
import { MulterModule } from '@nestjs/platform-express'
import { UsersModule } from '../users/users.module'
import { UploadsLinkService } from './uploads.link.service'

@Module({
    imports: [
        MulterModule.register({
            dest: 'uploads/',
        }),
        UsersModule,
    ],
    controllers: [UploadsController],
    providers: [UploadsService, UploadsLinkService],
    exports: [UploadsLinkService],
})
export class UploadsModule {}
