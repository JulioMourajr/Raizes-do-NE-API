import {
  ExceptionFilter, Catch, ArgumentsHost,
  HttpException, HttpStatus, Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx      = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request  = ctx.getRequest<Request>();

    let status  = HttpStatus.INTERNAL_SERVER_ERROR;
    let error   = 'ERRO_INTERNO';
    let message = 'Erro interno do servidor.';
    let details: unknown[] = [];

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const body = exception.getResponse();

      if (typeof body === 'object' && body !== null) {
        const b = body as Record<string, unknown>;
        error   = (b['error']   as string)  ?? 'ERRO_HTTP';
        message = (b['message'] as string)  ?? exception.message;
        details = (b['details'] as unknown[]) ?? [];
      } else {
        message = String(body);
        error   = 'ERRO_HTTP';
      }
    } else if (exception instanceof Error) {
      this.logger.error(exception.message, exception.stack);
    }

    response.status(status).json({
      error,
      message,
      details,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}