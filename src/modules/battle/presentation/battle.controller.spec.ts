import { type INestApplication, Logger, ValidationPipe } from '@nestjs/common'
import { APP_FILTER } from '@nestjs/core' // Import APP_FILTER
import { Test, TestingModule } from '@nestjs/testing'
import { randomUUID } from 'crypto'
import * as request from 'supertest'

import { StartBattleHandler } from '~battle/application/commands/start-battle/start-battle.handler'
import { CharacterNotAliveError } from '~battle/domain/errors/character-not-alive.error'
import { SelfBattleError } from '~battle/domain/errors/self-battle.error'
import { HttpExceptionFilter } from '~shared/application/filters/http-exception.filter'
import { CharacterNotFoundError } from '~shared/domain/errors/character-not-found.error'
import { BattleController } from './battle.controller'

describe('BattleController (Integration)', () => {
  let app: INestApplication
  let mockStartBattleHandler: jest.Mocked<StartBattleHandler>
  let originalLoggerError: any

  beforeEach(async () => {
    originalLoggerError = Logger.prototype.error
    Logger.prototype.error = jest.fn()
    mockStartBattleHandler = { handle: jest.fn() } as any

    const moduleRef: TestingModule = await Test.createTestingModule({
      controllers: [BattleController],
      providers: [
        { provide: APP_FILTER, useClass: HttpExceptionFilter },
        { provide: StartBattleHandler, useValue: mockStartBattleHandler },
      ],
    }).compile()

    app = moduleRef.createNestApplication()
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }))
    await app.init()
  })

  afterEach(async () => {
    Logger.prototype.error = originalLoggerError
    await app.close()
  })

  describe('POST /battle', () => {
    const character1Id = randomUUID()
    const character2Id = randomUUID()

    it('should start a battle between two characters and return the battle log', async () => {
      const battleLog = 'Battle between Warrior and Mage begins! Warrior wins the battle!'
      mockStartBattleHandler.handle.mockReturnValueOnce(battleLog)
      const response = await request(app.getHttpServer())
        .post('/battle')
        .send({ character1Id, character2Id })
        .expect(200)
      expect(response.body).toEqual({ log: battleLog })
      expect(mockStartBattleHandler.handle).toHaveBeenCalledWith(
        expect.objectContaining({ character1Id, character2Id }),
      )
    })

    it('should return 400 when trying to battle a character against itself', async () => {
      mockStartBattleHandler.handle.mockImplementationOnce(() => {
        throw new SelfBattleError(character1Id)
      })
      const response = await request(app.getHttpServer())
        .post('/battle')
        .send({ character1Id, character2Id: character1Id })
        .expect(400)
      expect(response.body.message).toContain(`Character with ID ${character1Id} cannot battle itself`)
    })

    it('should return 404 when character1 is not found', async () => {
      mockStartBattleHandler.handle.mockImplementationOnce(() => {
        throw new CharacterNotFoundError(character1Id)
      })
      const response = await request(app.getHttpServer())
        .post('/battle')
        .send({ character1Id, character2Id })
        .expect(404)
      expect(response.body.message).toContain(`Character with id '${character1Id}' not found`)
    })

    it('should return 404 when character2 is not found', async () => {
      mockStartBattleHandler.handle.mockImplementationOnce(() => {
        throw new CharacterNotFoundError(character2Id)
      })
      const response = await request(app.getHttpServer())
        .post('/battle')
        .send({ character1Id, character2Id })
        .expect(404)
      expect(response.body.message).toContain(`Character with id '${character2Id}' not found`)
    })

    it('should return 400 when one of the characters is not alive', async () => {
      const deadCharacterId = character2Id
      mockStartBattleHandler.handle.mockImplementationOnce(() => {
        throw new CharacterNotAliveError(deadCharacterId)
      })
      const response = await request(app.getHttpServer())
        .post('/battle')
        .send({ character1Id, character2Id })
        .expect(400)
      expect(response.body.message).toContain(`Character with ID ${deadCharacterId} is not alive`)
    })

    it('should propagate unknown errors from battle handler', async () => {
      const errorMessage = 'Unexpected error'
      mockStartBattleHandler.handle.mockImplementationOnce(() => {
        throw new Error(errorMessage)
      })
      await request(app.getHttpServer()).post('/battle').send({ character1Id, character2Id }).expect(500)
    })

    it('should return 400 for invalid character1Id format', async () => {
      const response = await request(app.getHttpServer())
        .post('/battle')
        .send({ character1Id: 'invalid-uuid', character2Id })
        .expect(400)
      expect(response.body.message).toContain('Character 1 ID must be a valid UUID')
    })

    it('should return 400 for invalid character2Id format', async () => {
      const response = await request(app.getHttpServer())
        .post('/battle')
        .send({ character1Id, character2Id: 'invalid-uuid' })
        .expect(400)
      expect(response.body.message).toContain('Character 2 ID must be a valid UUID')
    })

    it('should return 400 for missing character IDs', async () => {
      const response1 = await request(app.getHttpServer()).post('/battle').send({ character2Id }).expect(400)
      expect(response1.body.message).toEqual(expect.arrayContaining(['Character 1 ID must be a valid UUID']))
      const response2 = await request(app.getHttpServer()).post('/battle').send({ character1Id }).expect(400)
      expect(response2.body.message).toEqual(expect.arrayContaining(['Character 2 ID must be a valid UUID']))
    })

    it('should return 400 for extra fields in request body', async () => {
      const response = await request(app.getHttpServer())
        .post('/battle')
        .send({ character1Id, character2Id, extraField: 'should not be allowed' })
        .expect(400)
      expect(response.body.message).toContain('property extraField should not exist')
    })
  })
})
