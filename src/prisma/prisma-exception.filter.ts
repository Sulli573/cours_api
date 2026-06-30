import {
  ArgumentsHost,
  Catch,
  ConflictException,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import type { Request, Response } from 'express';
import { Prisma } from '../generated/prisma/client';

@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(PrismaExceptionFilter.name);

  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  catch(exception: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
    const { httpAdapter } = this.httpAdapterHost;
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();

    const httpException = this.toHttpException(exception);
    const status = httpException.getStatus();
    const body = {
      statusCode: status,
      message: httpException.message,
      error: HttpStatus[status],
      path: request.url,
      timestamp: new Date().toISOString(),
    };

    this.logger.warn(
      `Prisma ${exception.code} on ${request.method} ${request.url} → ${status}`,
    );

    httpAdapter.reply(response, body, status);
  }

  private toHttpException(
    exception: Prisma.PrismaClientKnownRequestError,
  ): HttpException {
    switch (exception.code) {
      case 'P2025':
        return new NotFoundException('Resource not found');

      case 'P2002': {
        const target = (exception.meta?.target as string[] | undefined)?.join(', ');
        return new ConflictException(
          target
            ? `A record with this ${target} already exists`
            : 'Resource already exists',
        );
      }

      default:
        this.logger.error(
          `Unhandled Prisma error code ${exception.code}: ${exception.message}`,
        );
        return new HttpException(
          'Internal server error',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
    }
  }
}