import { Module, ValidationPipe } from '@nestjs/common'
import { APP_FILTER, APP_PIPE } from '@nestjs/core'
import { HttpExceptionFilter } from './application/filters/http-exception.filter'

@Module({
  providers: [
    { provide: APP_PIPE, useClass: ValidationPipe },
    { provide: APP_FILTER, useClass: HttpExceptionFilter },
  ],
  exports: [],
})
export class SharedModule {}
