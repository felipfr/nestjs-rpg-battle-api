import { Job } from '~character/domain/enums/job.enum'
import { CharacterRepositoryInterface } from '~shared/domain/interfaces/character-repository.interface'
import { Character } from '../../domain/entities/character'
import { DuplicateCharacterNameError } from '../../domain/errors'
import { CharacterCreationService } from './character-creation.service'

describe('CharacterCreationService', () => {
  let service: CharacterCreationService
  let mockRepository: jest.Mocked<CharacterRepositoryInterface>

  beforeEach(async () => {
    mockRepository = {
      findById: jest.fn(),
      findByName: jest.fn(),
      save: jest.fn((character) => character),
      findAll: jest.fn(),
    }

    service = new CharacterCreationService(mockRepository)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('create', () => {
    it('should create a Warrior character with correct stats', () => {
      const name = 'TestWarrior'
      const job: Job = Job.Warrior
      mockRepository.findByName.mockReturnValueOnce(null)
      const result = service.create(name, job)
      expect(result).toBeInstanceOf(Character)
      expect(result.name).toBe(name)
      expect(result.job).toBe(job)
      expect(result.healthPoints).toBe(20)
      expect(result.maxHealthPoints).toBe(20)
      expect(result.stats.strength).toBe(10)
      expect(result.stats.dexterity).toBe(5)
      expect(result.stats.intelligence).toBe(5)
      expect(result.isAlive).toBe(true)
      expect(mockRepository.save).toHaveBeenCalledWith(expect.any(Character))
    })

    it('should create a Thief character with correct stats', () => {
      const name = 'TestThief'
      const job: Job = Job.Thief
      mockRepository.findByName.mockReturnValueOnce(null)
      const result = service.create(name, job)
      expect(result).toBeInstanceOf(Character)
      expect(result.name).toBe(name)
      expect(result.job).toBe(job)
      expect(result.healthPoints).toBe(15)
      expect(result.maxHealthPoints).toBe(15)
      expect(result.stats.strength).toBe(4)
      expect(result.stats.dexterity).toBe(10)
      expect(result.stats.intelligence).toBe(4)
      expect(result.isAlive).toBe(true)
    })

    it('should create a Mage character with correct stats', () => {
      const name = 'TestMage'
      const job: Job = Job.Mage
      mockRepository.findByName.mockReturnValueOnce(null)
      const result = service.create(name, job)
      expect(result).toBeInstanceOf(Character)
      expect(result.name).toBe(name)
      expect(result.job).toBe(job)
      expect(result.healthPoints).toBe(12)
      expect(result.maxHealthPoints).toBe(12)
      expect(result.stats.strength).toBe(5)
      expect(result.stats.dexterity).toBe(6)
      expect(result.stats.intelligence).toBe(10)
      expect(result.isAlive).toBe(true)
    })

    it('should throw DuplicateCharacterNameError when name is already used', () => {
      const name = 'DuplicateName'
      const job: Job = Job.Warrior
      const existingCharacter = Character.create({
        id: '1',
        name,
        job,
        healthPoints: 20,
        maxHealthPoints: 20,
        stats: {
          strength: 10,
          dexterity: 5,
          intelligence: 5,
        },
      })
      mockRepository.findByName.mockReturnValueOnce(existingCharacter)
      expect(() => service.create(name, job)).toThrow(DuplicateCharacterNameError)
      expect(mockRepository.findByName).toHaveBeenCalledWith(name)
      expect(mockRepository.save).not.toHaveBeenCalled()
    })
  })
})
