import * as process from 'node:process'
import { HttpAdapterHost, NestFactory, Reflector } from '@nestjs/core'
import { AppModule } from './app.module'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import {
    BadRequestException,
    ClassSerializerInterceptor,
    Logger,
    ValidationError,
    ValidationPipe,
} from '@nestjs/common'
import { PrismaClientExceptionFilter } from './prisma-client-exception.filter'
import * as express from 'express'
import { join } from 'node:path'
import { ErrorDto } from './system/utils/dto/error.dto'
import { ErrorCodes } from './system/utils/enums/errorCodes.enum'

process.on('unhandledRejection', (reason, promise) => {
    console.log('Unhandled Rejection at:', promise, 'reason:', reason)
})

async function bootstrap() {
    const app = await NestFactory.create(AppModule)
    app.useLogger(app.get(Logger))
    app.setGlobalPrefix('api')
    app.useGlobalPipes(
        new ValidationPipe({
            transform: true,
            transformOptions: {
                enableImplicitConversion: true,
            },
            whitelist: true,
            exceptionFactory: (errors: ValidationError[]) => {
                console.log(errors, 'errors')
                return new BadRequestException(
                    new ErrorDto(ErrorCodes.VALIDATION_ERROR, errors.map(e => Object.values(e.constraints)).flat())
                )
            },
        })
    )
    const { httpAdapter } = app.get(HttpAdapterHost)
    app.useGlobalFilters(new PrismaClientExceptionFilter(httpAdapter))
    app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)))
    app.enableCors({
        origin: '*', // или ваш конкретный домен
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
        allowedHeaders: 'Content-Type, Accept, Authorization',
    })

    const config = new DocumentBuilder()
        .setTitle('HoReCa API')
        .setDescription('The API for HoReCa')
        .setVersion('1.0')
        .addBearerAuth()
        .build()
    const document = SwaggerModule.createDocument(app, config)
    SwaggerModule.setup('api', app, document)

    app.use('/uploads', express.static(join(process.cwd(), 'uploads')))
    await app.listen(process.env.PORT, () => {
        console.log(`Application is running on ${process.env.PORT}`)
    })
}
bootstrap()
