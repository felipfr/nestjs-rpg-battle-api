import { ListCharacterDto } from '~character/application/dto/list-character.dto'
import { Character } from '~character/domain/entities/character'
import { Job } from '~character/domain/enums/job.enum'
import { PaginatedResult, PaginationDirection } from '~shared/application/dtos/cursor-pagination.dto'
import { InvalidCursorError } from '~shared/application/errors/invalid-cursor.error'
import { CharacterRepositoryInterface } from '~shared/domain/interfaces/character-repository.interface'
import { ListCharactersQueryHandler } from './list-characters.handler'
import { ListCharactersQuery } from './list-characters.query'

describe('ListCharactersQueryHandler', () => {
  let handler: ListCharactersQueryHandler
  let repositoryMock: jest.Mocked<CharacterRepositoryInterface>
  let characters: Character[]

  beforeEach(() => {
    repositoryMock = {
      findById: jest.fn(),
      findByName: jest.fn(),
      save: jest.fn(),
      findAll: jest.fn(),
    } as jest.Mocked<CharacterRepositoryInterface>

    handler = new ListCharactersQueryHandler(repositoryMock)
    characters = [
      createTestCharacter('1', 'Character 1', Job.Warrior),
      createTestCharacter('2', 'Character 2', Job.Thief),
      createTestCharacter('3', 'Character 3', Job.Mage),
    ]
  })

  it('should list characters without cursor', () => {
    const query = new ListCharactersQuery({ limit: 10, direction: PaginationDirection.NEXT })
    const paginatedResult = new PaginatedResult(characters, false)
    repositoryMock.findAll.mockReturnValue(paginatedResult)
    const result = handler.execute(query)
    expect(repositoryMock.findById).not.toHaveBeenCalled()
    expect(repositoryMock.findAll).toHaveBeenCalledWith({
      limit: 10,
      direction: PaginationDirection.NEXT,
      cursor: undefined,
    })
    expect(result.data).toHaveLength(3)
    expect(result.data[0]).toBeInstanceOf(ListCharacterDto)
    expect(result.data[0].id).toBe('1')
    expect(result.data[0].name).toBe('Character 1')
    expect(result.data[0].job).toBe(Job.Warrior)
  })

  it('should list characters with valid cursor', () => {
    const query = new ListCharactersQuery({ cursor: '2', limit: 2, direction: PaginationDirection.NEXT })
    repositoryMock.findById.mockReturnValue(characters[1])
    const paginatedResult = new PaginatedResult([characters[1], characters[2]], false, undefined, '1')
    repositoryMock.findAll.mockReturnValue(paginatedResult)
    const result = handler.execute(query)
    expect(repositoryMock.findById).toHaveBeenCalledWith('2')
    expect(repositoryMock.findAll).toHaveBeenCalledWith({ cursor: '2', limit: 2, direction: PaginationDirection.NEXT })
    expect(result.data).toHaveLength(2)
    expect(result.previousCursor).toBe('1')
  })

  it('should list characters with direction PREVIOUS', () => {
    const query = new ListCharactersQuery({ cursor: '3', limit: 2, direction: PaginationDirection.PREVIOUS })
    repositoryMock.findById.mockReturnValue(characters[2])
    const paginatedResult = new PaginatedResult([characters[0], characters[1]], true, '3', undefined)
    repositoryMock.findAll.mockReturnValue(paginatedResult)
    const result = handler.execute(query)
    expect(repositoryMock.findById).toHaveBeenCalledWith('3')
    expect(repositoryMock.findAll).toHaveBeenCalledWith({
      cursor: '3',
      limit: 2,
      direction: PaginationDirection.PREVIOUS,
    })
    expect(result.data).toHaveLength(2)
    expect(result.nextCursor).toBe('3')
  })

  it('should throw InvalidCursorError when cursor does not exist', () => {
    const query = new ListCharactersQuery({ cursor: 'non-existent', limit: 10, direction: PaginationDirection.NEXT })
    repositoryMock.findById.mockReturnValue(null)
    expect(() => handler.execute(query)).toThrow(InvalidCursorError)
    expect(() => handler.execute(query)).toThrow("Invalid pagination cursor: 'non-existent'")
  })

  it('should preserve pagination metadata in the result', () => {
    const query = new ListCharactersQuery({ limit: 2, direction: PaginationDirection.NEXT })
    const paginatedResult = new PaginatedResult([characters[0], characters[1]], true, '3', undefined)
    repositoryMock.findAll.mockReturnValue(paginatedResult)
    const result = handler.execute(query)
    expect(result.hasMore).toBe(true)
    expect(result.nextCursor).toBe('3')
    expect(result.previousCursor).toBeUndefined()
  })
})

// Helper para criar personagens de teste
function createTestCharacter(id: string, name: string, job: Job): Character {
  return Character.create({
    id,
    name,
    job,
    stats: { strength: 10, dexterity: 10, intelligence: 10 },
    healthPoints: 100,
    maxHealthPoints: 100,
  })
}
