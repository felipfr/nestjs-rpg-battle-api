import { ArgumentsHost, BadRequestException, HttpException, InternalServerErrorException } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import { FastifyReply } from 'fastify'

import { BattleAlreadyConcludedError } from '~battle/domain/errors/battle-already-concluded.error'
import { CharacterNotAliveError } from '~battle/domain/errors/character-not-alive.error'
import { SelfBattleError } from '~battle/domain/errors/self-battle.error'
import { DuplicateCharacterNameError } from '~character/domain/errors/duplicate-character-name.error'
import { CharacterNotFoundError } from '~shared/domain/errors/character-not-found.error'
import { InvalidCursorError } from '../errors/invalid-cursor.error'
import { HttpExceptionFilter } from './http-exception.filter'

describe('HttpExceptionFilter', () => {
  let filter: HttpExceptionFilter
  let host: ArgumentsHost
  let mockReply: FastifyReply

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [HttpExceptionFilter],
    }).compile()

    filter = module.get<HttpExceptionFilter>(HttpExceptionFilter)
    mockReply = { status: jest.fn().mockReturnThis(), send: jest.fn().mockReturnThis() } as any

    host = {
      switchToHttp: jest.fn().mockReturnValue({ getResponse: jest.fn().mockReturnValue(mockReply) }),
    } as unknown as ArgumentsHost

    jest.spyOn(filter['logger'], 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('catch', () => {
    it('should handle HttpException directly', () => {
      const httpException = new BadRequestException('Bad request')
      filter.catch(httpException, host)
      expect(host.switchToHttp).toHaveBeenCalled()
      expect(mockReply.status).toHaveBeenCalledWith(400)
      expect(mockReply.send).toHaveBeenCalled()
    })

    it.each([
      ['BattleAlreadyConcludedError', new BattleAlreadyConcludedError(), 400],
      ['CharacterNotAliveError', new CharacterNotAliveError('Character not alive'), 400],
      ['CharacterNotFoundError', new CharacterNotFoundError('Character not found'), 404],
      ['DuplicateCharacterNameError', new DuplicateCharacterNameError('Duplicate character name'), 409],
      ['InvalidCursorError', new InvalidCursorError('Invalid cursor'), 400],
      ['SelfBattleError', new SelfBattleError('Self battle not allowed'), 400],
    ])('should handle %s and map to correct HTTP status', (_, error, expectedStatus) => {
      filter.catch(error, host)
      expect(host.switchToHttp).toHaveBeenCalled()
      expect(mockReply.status).toHaveBeenCalledWith(expectedStatus)
      expect(mockReply.send).toHaveBeenCalled()
    })

    it('should handle unknown Error and create InternalServerError', () => {
      const error = new Error('Unknown error')
      filter.catch(error, host)
      expect(filter['logger'].error).toHaveBeenCalled()
      expect(mockReply.status).toHaveBeenCalledWith(500)
      expect(mockReply.send).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'Internal server error', statusCode: 500 }),
      )
    })

    it('should handle non-Error objects and create InternalServerError', () => {
      const nonError = { message: 'Not an error instance' }
      filter.catch(nonError, host)
      expect(filter['logger'].error).toHaveBeenCalledWith(nonError)
      expect(mockReply.status).toHaveBeenCalledWith(500)
      expect(mockReply.send).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'Internal server error', statusCode: 500 }),
      )
    })

    it('should handle primitive values and create InternalServerError', () => {
      const primitive = 'just a string'
      filter.catch(primitive, host)
      expect(filter['logger'].error).toHaveBeenCalledWith(primitive)
      expect(mockReply.status).toHaveBeenCalledWith(500)
      expect(mockReply.send).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'Internal server error', statusCode: 500 }),
      )
    })

    it('should handle null/undefined and create InternalServerError', () => {
      filter.catch(null, host)
      expect(filter['logger'].error).toHaveBeenCalledWith(null)
      expect(mockReply.status).toHaveBeenCalledWith(500)
      expect(mockReply.send).toHaveBeenCalled()
    })
  })

  describe('resolveHttpException', () => {
    it('should return HttpException if provided', () => {
      const httpException = new BadRequestException('Test')
      const result = filter['resolveHttpException'](httpException)
      expect(result).toBe(httpException)
    })

    it('should map domain error to HttpException', () => {
      const domainError = new CharacterNotFoundError('Character not found')
      const result = filter['resolveHttpException'](domainError)
      expect(result).toBeInstanceOf(HttpException)
      expect(result.getStatus()).toBe(404)
    })

    it('should create InternalServerError for unmapped Error', () => {
      const unmappedError = new Error('Unmapped error')
      const result = filter['resolveHttpException'](unmappedError)
      expect(result).toBeInstanceOf(InternalServerErrorException)
      expect(result.getStatus()).toBe(500)
    })
  })

  describe('mapDomainErrorToHttpException', () => {
    it('should return null for unmapped error type', () => {
      class UnmappedError extends Error {}
      const error = new UnmappedError('Unmapped')
      const result = filter['mapDomainErrorToHttpException'](error)
      expect(result).toBeNull()
    })
  })

  describe('createInternalServerError', () => {
    it('should log error details and return InternalServerErrorException', () => {
      const details = 'Error details'
      const result = filter['createInternalServerError'](details)
      expect(filter['logger'].error).toHaveBeenCalledWith(details)
      expect(result).toBeInstanceOf(InternalServerErrorException)
      expect(result.getResponse()).toEqual(
        expect.objectContaining({ message: 'Internal server error', statusCode: 500 }),
      )
    })
  })
})
