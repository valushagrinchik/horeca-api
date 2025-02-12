import { Controller, Param, Post, Delete, UploadedFile, UseInterceptors } from '@nestjs/common'
import { UploadsService } from './uploads.service'
import { FileInterceptor } from '@nestjs/platform-express/multer'
import { ApiBody, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger'
import { AuthUser } from '../auth/decorators'
import { UserRole } from '@prisma/client'
import { UploadDto } from './dto/upload.dto'

@Controller('uploads')
@ApiTags('Uploads')
@AuthUser(UserRole.Provider, UserRole.Horeca, UserRole.Admin)
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
    @UseInterceptors(
        FileInterceptor('file', {
            limits: { fileSize: Math.pow(1024, 2) * 1 },
        })
    )
    @ApiOperation({ summary: 'Загрузить файл. Роль пользователя: Поставщик/Хорека/Админ' })
    async upload(@UploadedFile() file: Express.Multer.File) {
        const upload = await this.uploadsService.upload(file)
        return new UploadDto(upload)
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Удалить файл. Роль пользователя: Поставщик/Хорека/Админ' })
    async delete(@Param('id') id: number): Promise<{ id: number }> {
        await this.uploadsService.delete(id)
        return { id }
    }
}
