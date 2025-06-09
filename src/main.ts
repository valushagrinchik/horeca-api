import * as process from 'node:process'
import { HttpAdapterHost, NestFactory, Reflector } from '@nestjs/core'
import { AppModule } from './app.module'
import { BadRequestException, ClassSerializerInterceptor, ValidationError, ValidationPipe } from '@nestjs/common'
import { ExceptionFilter } from './exception.filter'
import * as express from 'express'
import { join } from 'node:path'
import { ErrorDto, ErrorCodes } from '@/shared/utils'
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston'
import { initBullDashboard } from './shared/utils/initBullDashboard'
import { initSwaggerDoc } from './shared/utils/initSwaggerDoc'

process.on('unhandledRejection', (reason, promise) => {
    console.log('Unhandled Rejection at:', promise, 'reason:', reason)
})

async function bootstrap() {
    const app = await NestFactory.create(AppModule)

    app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER))
    app.setGlobalPrefix('api')
    app.useGlobalPipes(
        new ValidationPipe({
            transform: true,
            transformOptions: {
                enableImplicitConversion: true,
            },
            whitelist: true,
            forbidNonWhitelisted: true,
            exceptionFactory: (errors: ValidationError[]) => {
                return new BadRequestException(
                    new ErrorDto(
                        ErrorCodes.VALIDATION_ERROR,
                        errors
                            .filter(e => !!e.constraints)
                            .map(e => Object.values(e.constraints))
                            .flat()
                    )
                )
            },
        })
    )
    const { httpAdapter } = app.get(HttpAdapterHost)
    app.useGlobalFilters(new ExceptionFilter(httpAdapter))
    app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)))
    app.enableCors({
        origin: '*', // или ваш конкретный домен
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
        allowedHeaders: 'Content-Type, Accept, Authorization',
    })

    initSwaggerDoc(app)

    app.use('/uploads', express.static(join(process.cwd(), 'uploads')))

    initBullDashboard(app)

    await app.listen(process.env.PORT, '0.0.0.0', () => {
        console.log(`Application is running on ${process.env.PORT}`)
    })
}
bootstrap()
