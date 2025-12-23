import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AppConfig {
    constructor(private readonly config: ConfigService) { }

    get environment(): string {
        return this.config.get<string>('NODE_ENV', 'development');
    }

    get port(): number {
        return this.config.get<number>('PORT', 3003);
    }

    get jwt(): {
        secret: string;
        audience: string;
        issuer: string;
        expiresIn: string;
        algorithm: string;
    } {
        return {
            secret: this.config.get<string>('JWT_SECRET', 'secretKey'),
            audience: this.config.get<string>('JWT_AUDIENCE', 'http://localhost:3000'),
            issuer: this.config.get<string>('JWT_ISSUER', 'http://localhost:3000'),
            expiresIn: this.config.get<string>('JWT_EXPIRES_IN', '30d'),
            algorithm: this.config.get<string>('JWT_ALGORITHM', 'HS256')
        };
    }

    get api(): {
        clientId: string;
    } {
        return {
            clientId: this.config.get<string>('CLIENT_ID', 'clientId')
        };
    }

    get app(): {
        name: string;
        version: string;
        mode: string;
        description: string;
        author: string;
        url: string;
    } {
        return {
            name: this.config.get<string>('APP_NAME', 'NestJs API Starter Template'),
            version: this.config.get<string>('APP_VERSION', '1.0.0'),
            mode: this.config.get<string>('APP_MODE', 'local'),
            description: this.config.get<string>('APP_DESCRIPTION', 'NestJs API Starter Template'),
            author: this.config.get<string>('APP_AUTHOR', 'NestJs API Starter Template'),
            url: this.config.get<string>('APP_URL', 'http://localhost:3000')
        };
    }

    get database(): {
        url: string;
    } {
        return {
            url: this.config.get<string>('DATABASE_URL', '')
        };
    }

    get azureStorage(): {
        connectionString: string;
        containerName: string;
        defaultDomain: string;
        assignedDomain: string;
    } {
        return {
            connectionString: this.config.get<string>('AZURE_STORAGE_CONNECTION_STRING', ''),
            containerName: this.config.get<string>('AZURE_STORAGE_CONTAINER_NAME', ''),
            defaultDomain: this.config.get<string>('AZURE_STORAGE_DEFAULT_BASE_URL', ''),
            assignedDomain: this.config.get<string>('AZURE_STORAGE_ASSIGNED_BASE_URL', '')
        };
    }

    get email(): {
        fromName: string;
        fromEmail: string;
        replyToName: string;
        replyToEmail: string;
        developerEmail: string;
    } {
        return {
            fromName: this.config.get<string>('SMTP_FROM_NAME', ''),
            fromEmail: this.config.get<string>('SMTP_FROM_EMAIL', ''),
            replyToName: this.config.get<string>('SMTP_REPLY_TO_NAME', ''),
            replyToEmail: this.config.get<string>('SMTP_REPLY_TO_EMAIL', ''),
            developerEmail: this.config.get<string>('DEVELOPER_EMAIL', '')
        };
    }

    get smtp(): {
        host: string;
        port: number;
        username: string;
        password: string;
    } {
        return {
            host: this.config.get<string>('SMTP_HOST', ''),
            port: this.config.get<number>('SMTP_PORT', 587),
            username: this.config.get<string>('SMTP_USERNAME', ''),
            password: this.config.get<string>('SMTP_PASSWORD', '')
        };
    }
}
