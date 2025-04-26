import { CharacterDto } from '~character/application/dto/character.dto'
import { CharacterCreationService } from '~character/application/services/character-creation.service'
import { Character } from '~character/domain/entities/character'
import { Job } from '~character/domain/enums/job.enum'
import { CreateCharacterCommand } from './create-character.command'
import { CreateCharacterCommandHandler } from './create-character.handler'

describe('CreateCharacterCommandHandler', () => {
  let handler: CreateCharacterCommandHandler
  let mockCreationService: jest.Mocked<CharacterCreationService>

  beforeEach(async () => {
    mockCreationService = {
      create: jest.fn(),
    } as any

    handler = new CreateCharacterCommandHandler(mockCreationService)
  })

  it('should be defined', () => {
    expect(handler).toBeDefined()
  })

  it('should create a character and return CharacterDto', () => {
    const job: Job = Job.Warrior
    const command = new CreateCharacterCommand('TestWarrior', job)
    const character = Character.create(mockedCharacter)
    mockCreationService.create.mockReturnValueOnce(character)
    const result = handler.execute(command)
    expect(mockCreationService.create).toHaveBeenCalledWith('TestWarrior', job)
    expect(result).toBeInstanceOf(CharacterDto)
    expect(result).toEqual(expect.objectContaining(mockedCharacter))
  })
})

// Mock
const mockedCharacter = {
  id: 'test-id',
  name: 'TestWarrior',
  job: 'Warrior' as Job,
  healthPoints: 20,
  maxHealthPoints: 20,
  stats: { strength: 10, dexterity: 5, intelligence: 5 },
  isAlive: true,
}
