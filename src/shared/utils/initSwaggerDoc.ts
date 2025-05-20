
import { INestApplication } from "@nestjs/common";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";

export const initSwaggerDoc = (app: INestApplication) => {
    const config = new DocumentBuilder()
        .setTitle('HoReCa API')
        .setDescription('The API for HoReCa')
        .setVersion('1.0')
        .addBearerAuth()
        .build()
    const document = SwaggerModule.createDocument(app, config)
    SwaggerModule.setup('doc', app, document)
}