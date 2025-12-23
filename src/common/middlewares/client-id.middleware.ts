import { Request, Response, NextFunction } from 'express';
import { Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { AppConfig } from 'src/config/app.config';

@Injectable()
export class ClientIdMiddleware implements NestMiddleware {

  constructor(private readonly appConfig: AppConfig) { }

  use(req: Request, res: Response, next: NextFunction) {
    const clientId = req.headers['x-client-id'];
    if (!clientId) {
      throw new UnauthorizedException('Client ID is required');
    }

    if (clientId as string !== this.appConfig.api.clientId) {
      throw new UnauthorizedException('Invalid Client ID');
    }

    req.clientId = clientId as string;
    next();
  }
}
