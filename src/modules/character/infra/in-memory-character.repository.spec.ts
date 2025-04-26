import { CursorPaginationOptions, PaginationDirection } from '~shared/application/dtos/cursor-pagination.dto'
import { CursorPaginationHelper } from '~shared/application/helpers/cursor-pagination.helper'
import { Character } from '../domain/entities/character'
import { Job } from '../domain/enums/job.enum'
import { InMemoryCharacterRepository } from './in-memory-character.repository'

describe('InMemoryCharacterRepository', () => {
  let repository: InMemoryCharacterRepository
  let characters: Character[]

  beforeEach(() => {
    jest.clearAllMocks()
    repository = new InMemoryCharacterRepository()
    characters = [
      createTestCharacter('1', 'Character1'),
      createTestCharacter('2', 'Character2', Job.Thief),
      createTestCharacter('3', 'Character3', Job.Mage),
      createTestCharacter('4', 'Character4'),
      createTestCharacter('5', 'Character5'),
    ]
    characters.forEach((character) => repository.save(character))
  })

  describe('findById', () => {
    it('should return a character if found', () => {
      const result = repository.findById('3')
      expect(result).toBeDefined()
      expect(result?.id).toBe('3')
      expect(result?.name).toBe('Character3')
    })

    it('should return null if character is not found', () => {
      const result = repository.findById('non-existent')
      expect(result).toBeNull()
    })
  })

  describe('findByName', () => {
    it('should return a character if found (case insensitive)', () => {
      const result = repository.findByName('character2')
      expect(result).toBeDefined()
      expect(result?.id).toBe('2')
      expect(result?.name).toBe('Character2')
    })

    it('should return null if character is not found', () => {
      const result = repository.findByName('non-existent')
      expect(result).toBeNull()
    })
  })

  describe('save', () => {
    it('should store a character and return it', () => {
      const newCharacter = createTestCharacter('6', 'NewCharacter')
      const result = repository.save(newCharacter)
      expect(result).toBe(newCharacter)
      expect(repository.findById('6')).toBe(newCharacter)
    })

    it('should update an existing character', () => {
      const updatedCharacter = createTestCharacter('1', 'UpdatedCharacter')
      const result = repository.save(updatedCharacter)
      expect(result).toBe(updatedCharacter)
      expect(repository.findById('1')?.name).toBe('UpdatedCharacter')
    })
  })

  describe('findAll', () => {
    let mockPaginatedResult: any

    beforeEach(() => {
      mockPaginatedResult = { data: characters, hasMore: false }
      jest.spyOn(CursorPaginationHelper, 'paginate').mockReturnValue(mockPaginatedResult)
    })

    it('should return all characters when no options are provided', () => {
      const result = repository.findAll()
      expect(result).toEqual(mockPaginatedResult)
    })

    it('should return paginated characters when options are provided', () => {
      const options: CursorPaginationOptions = { limit: 2, direction: PaginationDirection.NEXT }
      const result = repository.findAll(options)
      expect(result).toEqual(mockPaginatedResult)
      expect(CursorPaginationHelper.paginate).toHaveBeenCalledWith(Array.from(characters), options)
    })

    it('should return an empty array when no characters are available', () => {
      const emptyRepository = new InMemoryCharacterRepository()
      const emptyResult = { data: [], hasMore: false }
      jest.spyOn(CursorPaginationHelper, 'paginate').mockReturnValue(emptyResult)
      const result = emptyRepository.findAll()
      expect(CursorPaginationHelper.paginate).toHaveBeenCalledWith([], undefined)
      expect(result).toEqual(emptyResult)
    })

    it('should return paginated characters when options are provided and there are more characters', () => {
      const options: CursorPaginationOptions = { limit: 2, direction: PaginationDirection.NEXT }
      const paginatedCharacters = characters.slice(0, 2)
      const paginatedResult = { data: paginatedCharacters, hasMore: true, nextCursor: '3', previousCursor: undefined }
      jest.spyOn(CursorPaginationHelper, 'paginate').mockReturnValue(paginatedResult)
      const result = repository.findAll(options)
      expect(result).toEqual(paginatedResult)
      expect(CursorPaginationHelper.paginate).toHaveBeenCalledWith(Array.from(characters), options)
    })

    it('should call CursorPaginationHelper.paginate without options when no options are provided', () => {
      const result = repository.findAll()
      expect(CursorPaginationHelper.paginate).toHaveBeenCalledWith(Array.from(characters), undefined)
      expect(result).toBe(mockPaginatedResult)
    })

    it('should call CursorPaginationHelper.paginate with provided options', () => {
      const options: CursorPaginationOptions = { limit: 2, direction: PaginationDirection.NEXT }
      const result = repository.findAll(options)
      expect(CursorPaginationHelper.paginate).toHaveBeenCalledWith(Array.from(characters), options)
      expect(result).toBe(mockPaginatedResult)
    })
  })
})

// Helper function to create a test character
const createTestCharacter = (id: string, name: string, job: Job = Job.Warrior): Character => {
  return Character.create({
    id,
    name,
    job,
    stats: { strength: 10, dexterity: 5, intelligence: 5 },
    healthPoints: 20,
    maxHealthPoints: 20,
  })
}
