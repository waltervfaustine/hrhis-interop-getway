/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const res = host.switchToHttp().getResponse();
    const req = host.switchToHttp().getRequest();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : (exception?.response?.status ?? HttpStatus.BAD_GATEWAY);

    res.status(status).json({
      status,
      path: req.url,
      error: exception?.message || 'Unhandled error',
      requestId: req.headers['x-request-id'],
    });
  }
}
