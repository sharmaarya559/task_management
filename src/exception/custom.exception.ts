import { Catch, HttpException } from '@nestjs/common';

@Catch(HttpException)
export class CustomException extends HttpException {
  constructor(message: string, status: number) {
    super(message, status || 500);
  }
}
