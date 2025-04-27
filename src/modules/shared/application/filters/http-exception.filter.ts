import {
  ArgumentsHost,
  BadRequestException,
  Catch,
  ConflictException,
  ExceptionFilter,
  HttpException,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common'

import { BattleAlreadyConcludedError } from '~battle/domain/errors/battle-already-concluded.error'
import { CharacterNotAliveError } from '~battle/domain/errors/character-not-alive.error'
import { SelfBattleError } from '~battle/domain/errors/self-battle.error'
import { DuplicateCharacterNameError } from '~character/domain/errors/duplicate-character-name.error'
import { CharacterNotFoundError } from '~shared/domain/errors/character-not-found.error'
import { InvalidCursorError } from '../errors/invalid-cursor.error'

type ErrorClass = new (...args: any[]) => Error
type HttpExceptionCreator = (message: string) => HttpException

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name)

  private readonly errorMap = new Map<ErrorClass, HttpExceptionCreator>([
    [BattleAlreadyConcludedError, (message) => new BadRequestException(message)],
    [CharacterNotAliveError, (message) => new BadRequestException(message)],
    [CharacterNotFoundError, (message) => new NotFoundException(message)],
    [DuplicateCharacterNameError, (message) => new ConflictException(message)],
    [InvalidCursorError, (message) => new BadRequestException(message)],
    [SelfBattleError, (message) => new BadRequestException(message)],
  ])

  catch(exception: unknown, host: ArgumentsHost) {
    const httpContext = host.switchToHttp()
    const response = httpContext.getResponse()
    const httpException = this.resolveHttpException(exception)
    const status = httpException.getStatus()
    const responseBody = httpException.getResponse()
    response.status(status).send(responseBody)
  }

  private resolveHttpException(exception: unknown): HttpException {
    if (exception instanceof HttpException) return exception
    if (exception instanceof Error) {
      return this.mapDomainErrorToHttpException(exception) ?? this.createInternalServerError(exception.stack)
    }
    return this.createInternalServerError(exception)
  }

  private mapDomainErrorToHttpException(error: Error): HttpException | null {
    for (const [errorType, exceptionCreator] of this.errorMap.entries()) {
      if (error instanceof errorType) {
        return exceptionCreator(error.message)
      }
    }
    return null
  }

  private createInternalServerError(details: unknown): InternalServerErrorException {
    this.logger.error(details)
    return new InternalServerErrorException('Internal server error')
  }
}
