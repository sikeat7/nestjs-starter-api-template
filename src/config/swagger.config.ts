import { INestApplication } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import redocExpress from 'redoc-express';
import { AppConfig } from './app.config';

export function setupSwagger(app: INestApplication): void {

    const appConfig = app.get(AppConfig);

    const config = new DocumentBuilder()
        .setTitle(appConfig.app.name)
        .setDescription(appConfig.app.description)
        .setVersion(appConfig.app.version)
        .addBearerAuth(
            {
                type: 'http',
                scheme: 'bearer',
                bearerFormat: 'JWT',
                name: 'Authorization',
                in: 'header',
            },
            'access-token',
        )
        .addSecurityRequirements('access-token')
        .build();

    const document = SwaggerModule.createDocument(app, config);

    // Swagger UI
    SwaggerModule.setup('docs', app, document, {
        swaggerOptions: {
            persistAuthorization: true,
        },
    });

    // Swagger JSON
    app.getHttpAdapter().get('/docs-json', (req, res) => {
        res.json(document);
    });

    // ReDoc
    app.use(
        '/redoc',
        redocExpress({
            title: `${appConfig.app.name} API Docs`,
            specUrl: '/docs-json'
        }),
    );
}
