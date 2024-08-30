import { Controller, Get, Param, Post, Delete, StreamableFile, UploadedFile, UseInterceptors } from '@nestjs/common'
import { UploadsService } from './uploads.service'
import { FileInterceptor } from '@nestjs/platform-express/multer'
import { createReadStream } from 'fs'
import { join } from 'path'
import { ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger'
import { AuthUser } from '../system/utils/auth/decorators/auth.decorator'
import { UserRole } from '@prisma/client'
import { RequestDecorator } from '../system/utils/swagger/decorators'
import { UploadDto } from './dto/upload.dto'

@AuthUser(UserRole.Provider, UserRole.Horeca, UserRole.Admin)
@Controller('uploads')
@ApiTags('Uploads')
export class UploadsController {
    constructor(private readonly uploadsService: UploadsService) {}

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
    @UseInterceptors(FileInterceptor('file'))
    async upload(@UploadedFile() file: Express.Multer.File) {
        const upload = await this.uploadsService.upload(file)
        return new UploadDto(upload)
    }

    @Get(':id')
    @RequestDecorator(StreamableFile)
    async read(@Param('id') id: number): Promise<StreamableFile> {
        const upload = await this.uploadsService.findOne(id)
        const file = createReadStream(join(process.cwd(), upload.path))
        return new StreamableFile(file)
    }

    @Delete(':id')
    async delete(@Param('id') id: number): Promise<{ id: number }> {
        await this.uploadsService.delete(id)
        return { id }
    }
}
