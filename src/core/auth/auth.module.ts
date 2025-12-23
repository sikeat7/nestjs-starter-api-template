import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserModule } from '../user/user.module';
import { JwtModule } from '@nestjs/jwt';
import { AppConfig } from 'src/config/app.config';
import { Algorithm } from 'jsonwebtoken';

@Module({
    imports: [
        UserModule,
        JwtModule.registerAsync({
            global: true,
            inject: [AppConfig],
            useFactory: (config: AppConfig) => ({
                secret: config.jwt.secret,
                signOptions: {
                    expiresIn: config.jwt.expiresIn as any,
                    //algorithms: [config.jwt.algorithm as Algorithm],
                    audience: config.jwt.audience,
                    issuer: config.jwt.issuer,
                }
            }),
        }),
    ],
    controllers: [AuthController],
    providers: [AuthService],
    exports: [AuthService]
})
export class AuthModule { }
