import { CharacterDto } from '~character/application/dto/character.dto'
import { Character } from '~character/domain/entities/character'
import { Job } from '~character/domain/enums/job.enum'
import { CharacterNotFoundError } from '~character/domain/errors'
import { CharacterRepositoryInterface } from '~shared/domain/interfaces/character-repository.interface'
import { GetCharacterByIdQueryHandler } from './get-character-by-id.handler'
import { GetCharacterByIdQuery } from './get-character-by-id.query'

describe('GetCharacterByIdQueryHandler', () => {
  let handler: GetCharacterByIdQueryHandler
  let mockCharacterRepository: jest.Mocked<CharacterRepositoryInterface>

  beforeEach(() => {
    mockCharacterRepository = {
      findById: jest.fn(),
      save: jest.fn(),
      findAll: jest.fn(),
      findByName: jest.fn(),
    } as jest.Mocked<CharacterRepositoryInterface>
    handler = new GetCharacterByIdQueryHandler(mockCharacterRepository)
  })

  it('should return a CharacterDto when the character exists', () => {
    const characterId = 'valid-character-id'
    const mockCharacter = {
      id: characterId,
      name: 'Test Character',
      job: Job.Warrior,
      stats: {
        strength: 10,
        dexterity: 7,
        intelligence: 5,
      },
      healthPoints: 100,
      maxHealthPoints: 100,
      isAlive: true,
      attackPower: 10,
      speed: 7,
      // Outros métodos necessários
      calculateAttackModifier: jest.fn().mockReturnValue(10),
      calculateSpeedModifier: jest.fn().mockReturnValue(7),
      receiveDamage: jest.fn(),
    } as unknown as Character
    mockCharacterRepository.findById.mockReturnValue(mockCharacter)
    const mockCharacterDto = {
      id: characterId,
      name: 'Test Character',
      job: Job.Warrior,
      healthPoints: 100,
      maxHealthPoints: 100,
      stats: {
        strength: 10,
        dexterity: 7,
        intelligence: 5,
      },
      isAlive: true,
      attackPower: 10,
      speed: 7,
      attackModifier: 10,
      speedModifier: 7,
    } as CharacterDto
    jest.spyOn(CharacterDto, 'fromDomain').mockReturnValue(mockCharacterDto)
    const query = new GetCharacterByIdQuery(characterId)
    const result = handler.execute(query)
    expect(mockCharacterRepository.findById).toHaveBeenCalledWith(characterId)
    expect(CharacterDto.fromDomain).toHaveBeenCalledWith(mockCharacter)
    expect(result).toEqual(mockCharacterDto)
  })

  it('should throw CharacterNotFoundError when the character does not exist', () => {
    const characterId = 'non-existent-id'
    mockCharacterRepository.findById.mockReturnValue(null)
    const query = new GetCharacterByIdQuery(characterId)
    expect(() => handler.execute(query)).toThrow(CharacterNotFoundError)
    expect(() => handler.execute(query)).toThrow(`Character with id '${characterId}' not found`)
    expect(mockCharacterRepository.findById).toHaveBeenCalledWith(characterId)
  })
})
