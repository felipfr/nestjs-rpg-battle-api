import { type INestApplication, Logger, ValidationPipe } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import { randomUUID } from 'crypto'
import * as request from 'supertest'
import { CreateCharacterCommandHandler } from '~character/application/commands/create-character/create-character.handler'
import { GetCharacterByIdQueryHandler } from '~character/application/queries/get-character-by-id/get-character-by-id.handler'
import { ListCharactersQueryHandler } from '~character/application/queries/list-characters/list-characters.handler'
import { Job } from '~character/domain/enums/job.enum'
import { Stats } from '~character/domain/value-objects/stats.vo'
import { CharacterDto } from '../application/dto/character.dto'
import { CharacterNotFoundError, DuplicateCharacterNameError, InvalidCursorError } from '../domain/errors'
import { CharacterController } from './character.controller'

describe('CharacterController (Integration)', () => {
  let app: INestApplication
  let mockCreateCharacterHandler: jest.Mocked<CreateCharacterCommandHandler>
  let mockGetCharacterByIdHandler: jest.Mocked<GetCharacterByIdQueryHandler>
  let mockListCharactersHandler: jest.Mocked<ListCharactersQueryHandler>
  let originalLoggerError: any

  beforeEach(async () => {
    originalLoggerError = Logger.prototype.error
    Logger.prototype.error = jest.fn()

    mockCreateCharacterHandler = { execute: jest.fn() } as any
    mockGetCharacterByIdHandler = { execute: jest.fn() } as any
    mockListCharactersHandler = { execute: jest.fn() } as any

    const moduleRef: TestingModule = await Test.createTestingModule({
      controllers: [CharacterController],
      providers: [
        { provide: CreateCharacterCommandHandler, useValue: mockCreateCharacterHandler },
        { provide: GetCharacterByIdQueryHandler, useValue: mockGetCharacterByIdHandler },
        { provide: ListCharactersQueryHandler, useValue: mockListCharactersHandler },
      ],
    }).compile()

    app = moduleRef.createNestApplication()
    app.useGlobalPipes(new ValidationPipe({ transform: true }))
    await app.init()
  })

  afterEach(async () => {
    Logger.prototype.error = originalLoggerError
    await app.close()
  })

  describe('GET /characters', () => {
    it('should return a paginated list of characters', async () => {
      mockListCharactersHandler.execute.mockReturnValueOnce({
        data: [
          { id: 'uuid-1', name: 'Hero_One', job: Job.Warrior, isAlive: true },
          { id: 'uuid-2', name: 'Sneaky_Thief', job: Job.Thief, isAlive: false },
        ],
        nextCursor: 'uuid-2',
        hasMore: true,
      })
      const response = await request(app.getHttpServer())
        .get('/characters')
        .query({ limit: 10, cursor: null, direction: 'next' })
        .expect(200)
      expect(response.body).toEqual({
        data: [
          { id: 'uuid-1', name: 'Hero_One', job: 'Warrior', isAlive: true },
          { id: 'uuid-2', name: 'Sneaky_Thief', job: 'Thief', isAlive: false },
        ],
        nextCursor: 'uuid-2',
        hasMore: true,
      })
      expect(mockListCharactersHandler.execute).toHaveBeenCalled()
    })

    it('should propagate unknown errors from list handler', async () => {
      const errorMessage = 'Unexpected error'
      mockListCharactersHandler.execute.mockImplementationOnce(() => {
        throw new Error(errorMessage)
      })
      await request(app.getHttpServer())
        .get('/characters')
        .query({ limit: 10, cursor: null, direction: 'next' })
        .expect(500)
    })

    it('should return 400 for invalid cursor error', async () => {
      mockListCharactersHandler.execute.mockImplementationOnce(() => {
        throw new InvalidCursorError('invalid-cursor-id')
      })
      const response = await request(app.getHttpServer())
        .get('/characters')
        .query({ limit: 10, cursor: 'invalid-cursor-id', direction: 'next' })
        .expect(400)
      expect(response.body.message).toContain('Invalid pagination cursor')
    })

    it('should return 400 for invalid limit', async () => {
      const response = await request(app.getHttpServer())
        .get('/characters')
        .query({ limit: 0, cursor: null, direction: 'next' })
        .expect(400)
      expect(response.body.message).toContain('limit must not be less than 1')
    })

    it('should return 400 for invalid direction', async () => {
      const response = await request(app.getHttpServer())
        .get('/characters')
        .query({ limit: 10, cursor: null, direction: 'invalid' })
        .expect(400)
      expect(response.body.message).toContain('direction must be one of the following values: next, previous')
    })

    it('should return an empty list if no characters exist', async () => {
      mockListCharactersHandler.execute.mockReturnValueOnce({
        data: [],
        hasMore: false,
      })
      const response = await request(app.getHttpServer())
        .get('/characters')
        .query({ limit: 10, cursor: null, direction: 'next' })
        .expect(200)
      expect(response.body).toEqual({
        data: [],
        hasMore: false,
      })
    })
  })

  describe('GET /characters/:id', () => {
    const validUuid = randomUUID()

    it('should return a character by id', async () => {
      const characterDto = new CharacterDto()
      Object.assign(characterDto, {
        id: validUuid,
        name: 'TestCharacter',
        job: 'Warrior',
        healthPoints: 20,
        maxHealthPoints: 20,
        attackModifier: 18,
        speedModifier: 12,
        stats: { strength: 10, dexterity: 5, intelligence: 5 },
        isAlive: true,
      })
      mockGetCharacterByIdHandler.execute.mockReturnValueOnce(characterDto)
      const response = await request(app.getHttpServer()).get(`/characters/${validUuid}`).expect(200)
      expect(response.body).toEqual({
        id: validUuid,
        name: 'TestCharacter',
        job: 'Warrior',
        healthPoints: 20,
        maxHealthPoints: 20,
        attackModifier: 18,
        speedModifier: 12,
        stats: { strength: 10, dexterity: 5, intelligence: 5 },
        isAlive: true,
      })
      expect(mockGetCharacterByIdHandler.execute).toHaveBeenCalledWith(expect.objectContaining({ id: validUuid }))
    })

    it('should propagate unknown errors from get character handler', async () => {
      const errorMessage = 'Unexpected error'
      const validUuid = randomUUID()
      mockGetCharacterByIdHandler.execute.mockImplementationOnce(() => {
        throw new Error(errorMessage)
      })
      await request(app.getHttpServer()).get(`/characters/${validUuid}`).expect(500)
    })

    it('should return 404 when character is not found', async () => {
      const notFoundUuid = randomUUID()
      mockGetCharacterByIdHandler.execute.mockImplementationOnce(() => {
        throw new CharacterNotFoundError(notFoundUuid)
      })
      const response = await request(app.getHttpServer()).get(`/characters/${notFoundUuid}`).expect(404)
      expect(response.body.message).toContain(`Character with id '${notFoundUuid}' not found`)
      expect(mockGetCharacterByIdHandler.execute).toHaveBeenCalledWith(expect.objectContaining({ id: notFoundUuid }))
    })

    it('should return 400 for invalid UUID format', async () => {
      const response = await request(app.getHttpServer()).get('/characters/invalid-uuid').expect(400)
      expect(response.body.message).toContain('ID must be a valid UUID')
    })

    const characterTypes = [
      {
        job: Job.Warrior,
        stats: { strength: 10, dexterity: 5, intelligence: 5 },
        hp: 20,
        attackMod: 18,
        speedMod: 12,
      },
      {
        job: Job.Thief,
        stats: { strength: 4, dexterity: 10, intelligence: 4 },
        hp: 15,
        attackMod: 16,
        speedMod: 18,
      },
      {
        job: Job.Mage,
        stats: { strength: 5, dexterity: 6, intelligence: 10 },
        hp: 12,
        attackMod: 15,
        speedMod: 13,
      },
    ]

    const testGetCharacterWithJob = (job: Job, stats: Stats, hp: number, attackMod: number, speedMod: number) => {
      it(`should return a ${job} character with correct attributes`, async () => {
        const jobUuid = randomUUID()
        const characterDto = new CharacterDto()
        Object.assign(characterDto, {
          id: jobUuid,
          name: `Test${job}`,
          job,
          healthPoints: hp,
          maxHealthPoints: hp,
          attackModifier: attackMod,
          speedModifier: speedMod,
          stats,
          isAlive: true,
        })
        mockGetCharacterByIdHandler.execute.mockReturnValueOnce(characterDto)
        const response = await request(app.getHttpServer()).get(`/characters/${jobUuid}`).expect(200)
        expect(response.body).toEqual({
          id: jobUuid,
          name: `Test${job}`,
          job,
          healthPoints: hp,
          maxHealthPoints: hp,
          attackModifier: attackMod,
          speedModifier: speedMod,
          stats,
          isAlive: true,
        })
        expect(mockGetCharacterByIdHandler.execute).toHaveBeenCalledWith(expect.objectContaining({ id: jobUuid }))
      })
    }
    characterTypes.forEach(({ job, stats, hp, attackMod, speedMod }) => {
      testGetCharacterWithJob(job, stats, hp, attackMod, speedMod)
    })
  })

  describe('POST /characters', () => {
    it('should create a Warrior character successfully', async () => {
      const characterDto = new CharacterDto()
      Object.assign(characterDto, {
        id: 'test-id',
        name: 'TestWarrior',
        job: 'Warrior',
        healthPoints: 20,
        maxHealthPoints: 20,
        attackModifier: 18,
        speedModifier: 12,
        stats: { strength: 10, dexterity: 5, intelligence: 5 },
        isAlive: true,
      })
      mockCreateCharacterHandler.execute.mockReturnValueOnce(characterDto)
      const response = await request(app.getHttpServer())
        .post('/characters')
        .send({ name: 'TestWarrior', job: 'Warrior' })
        .expect(201)
      expect(response.body).toEqual({
        id: 'test-id',
        name: 'TestWarrior',
        job: 'Warrior',
        healthPoints: 20,
        maxHealthPoints: 20,
        attackModifier: 18,
        speedModifier: 12,
        stats: { strength: 10, dexterity: 5, intelligence: 5 },
        isAlive: true,
      })
      expect(mockCreateCharacterHandler.execute).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'TestWarrior', job: 'Warrior' }),
      )
    })

    it('should propagate unknown errors from create character handler', async () => {
      const errorMessage = 'Unexpected error'
      mockCreateCharacterHandler.execute.mockImplementationOnce(() => {
        throw new Error(errorMessage)
      })
      await request(app.getHttpServer()).post('/characters').send({ name: 'ValidName', job: 'Warrior' }).expect(500)
    })

    it('should validate required fields', async () => {
      const response1 = await request(app.getHttpServer()).post('/characters').send({ job: 'Warrior' }).expect(400)
      expect(response1.body.message).toEqual(
        expect.arrayContaining([
          'Name must contain only letters (A-Z, a-z) and underscore (_), no numbers or special characters',
          'Name must be between 4 and 15 characters',
          'Name must be a string',
        ]),
      )
      const response2 = await request(app.getHttpServer()).post('/characters').send({ name: 'ValidName' }).expect(400)
      expect(response2.body.message).toEqual(expect.arrayContaining(['Job must be one of: Warrior, Thief, or Mage']))
    })

    it('should return 409 when character name already exists', async () => {
      mockCreateCharacterHandler.execute.mockImplementationOnce(() => {
        throw new DuplicateCharacterNameError('TestDuplicate')
      })
      const response = await request(app.getHttpServer())
        .post('/characters')
        .send({ name: 'TestDuplicate', job: 'Warrior' })
        .expect(409)
      expect(response.body.message).toContain('is already in use')
    })

    const jobTests: { job: Job; stats: Stats }[] = [
      {
        job: Job.Warrior,
        stats: { strength: 10, dexterity: 5, intelligence: 5 },
      },
      {
        job: Job.Thief,
        stats: { strength: 4, dexterity: 10, intelligence: 4 },
      },
      {
        job: Job.Mage,
        stats: { strength: 5, dexterity: 6, intelligence: 10 },
      },
    ]

    const testCreateCharacterWithJob = (job: Job, stats: any) => {
      it(`should create a ${job} with correct stats`, async () => {
        const characterDto = new CharacterDto()
        Object.assign(characterDto, { id: `test-id-${job}`, name: `Test${job}`, job, ...stats, isAlive: true })
        mockCreateCharacterHandler.execute.mockReturnValueOnce(characterDto)
        const response = await request(app.getHttpServer())
          .post('/characters')
          .send({ name: `Test${job}`, job })
          .expect(201)
        expect(response.body).toMatchObject({ name: `Test${job}`, job, ...stats })
      })
    }

    jobTests.forEach(({ job, stats }) => {
      testCreateCharacterWithJob(job, stats)
    })
  })
})
