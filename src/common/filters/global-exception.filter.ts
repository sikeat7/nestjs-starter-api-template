import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpException,
    HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import CustomResponse from '../dto/custom-response.dto';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
    catch(exception: unknown, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();

        if (exception instanceof HttpException) {
            const status = exception.getStatus();
            const res = exception.getResponse() as any;

            return response.status(status).json(
                new CustomResponse(
                    res.message || 'Request failed',
                    null,
                    status,
                    res.errorCode,
                    res.errors,
                ),
            );
        }

        // Fallback for unknown errors
        const unknownErrorMessage: string = exception instanceof Error ? exception.message : 'Unknown error';
        response.status(HttpStatus.INTERNAL_SERVER_ERROR).json(
            new CustomResponse(
                unknownErrorMessage,
                null,
                500,
                'INTERNAL_SERVER_ERROR',
            ),
        );
    }
}
