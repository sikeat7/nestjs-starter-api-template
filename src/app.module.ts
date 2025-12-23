import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import * as Joi from 'joi';
import { AppConfigModule } from './config/app.config.module';
import { HealthModule } from './health/health.module';
import { ClientIdMiddleware } from './common/middlewares/client-id.middleware';
import { DatabaseModule } from './database/database.module';
import { CoreModule } from './core/core.module';
import { MulterModule } from '@nestjs/platform-express';
import { multerConfig } from './common/multer/multer.config';
import { AzureStorageModule } from './infrastructure/storage/azure/azure-storage.module';
import { ClientDetailsMiddleware } from './common/middlewares/client-details.middleware';
import { CountryModule } from './country/country.module';

@Module({
  imports: [ConfigModule.forRoot({
    isGlobal: true,
    ignoreEnvFile: process.env.NODE_ENV === 'production',
    envFilePath: [
      '.env.local',
      `.env.${process.env.NODE_ENV}`,
      '.env',
    ],
    validationSchema: Joi.object({
      NODE_ENV: Joi.string().valid('development', 'production').required(),
      PORT: Joi.number().default(3001),
      DATABASE_URL: Joi.string().required(),
    })
  }),
    AppConfigModule,
    DatabaseModule,
    HealthModule,
    AzureStorageModule,
    CoreModule,
  MulterModule.register(multerConfig),
  CountryModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(ClientDetailsMiddleware).forRoutes('/api/*path');
    consumer
      .apply(ClientIdMiddleware)
      .exclude(
        'health/check',
        'auth/login',
        'auth/register',
      )
      .forRoutes('/api/*path');
  }
}
