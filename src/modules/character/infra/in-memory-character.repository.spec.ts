import { CursorPaginationOptions } from '~shared/application/dtos/cursor-pagination.dto'
import { Character } from '../domain/entities/character'
import { Job } from '../domain/enums/job.enum'
import { InMemoryCharacterRepository } from './in-memory-character.repository'

describe('InMemoryCharacterRepository', () => {
  let repository: InMemoryCharacterRepository
  let characters: Character[]

  beforeEach(() => {
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
    it('should return all characters when no options are provided', () => {
      const result = repository.findAll()
      expect(result.data.length).toBe(5)
      expect(result.hasMore).toBe(false)
      expect(result.nextCursor).toBeUndefined()
      expect(result.previousCursor).toBeUndefined()
    })

    it('should return limited number of characters when limit is provided', () => {
      const options: CursorPaginationOptions = { limit: 2, direction: 'next' }
      const result = repository.findAll(options)
      expect(result.data.length).toBe(2)
      expect(result.data[0].id).toBe('1')
      expect(result.data[1].id).toBe('2')
      expect(result.hasMore).toBe(true)
      expect(result.nextCursor).toBe('2')
      expect(result.previousCursor).toBe('1')
    })

    it('should return characters after cursor when direction is "next"', () => {
      const options: CursorPaginationOptions = { cursor: '2', limit: 2, direction: 'next' }
      const result = repository.findAll(options)
      expect(result.data.length).toBe(2)
      expect(result.data[0].id).toBe('3')
      expect(result.data[1].id).toBe('4')
      expect(result.hasMore).toBe(true)
      expect(result.nextCursor).toBe('4')
      expect(result.previousCursor).toBe('3')
    })

    it('should return characters before cursor when direction is "previous"', () => {
      const options: CursorPaginationOptions = { cursor: '4', limit: 2, direction: 'previous' }
      const result = repository.findAll(options)
      expect(result.data.length).toBe(2)
      expect(result.data[0].id).toBe('2')
      expect(result.data[1].id).toBe('3')
      expect(result.hasMore).toBe(true)
      expect(result.nextCursor).toBe('3')
      expect(result.previousCursor).toBe('2')
    })

    it('should correctly handle when cursor is the first item', () => {
      const options: CursorPaginationOptions = { cursor: '1', limit: 2, direction: 'previous' }
      const result = repository.findAll(options)
      expect(result.data.length).toBe(0)
      expect(result.hasMore).toBe(false)
      expect(result.nextCursor).toBeUndefined()
      expect(result.previousCursor).toBeUndefined()
    })

    it('should correctly handle when cursor is the last item', () => {
      const options: CursorPaginationOptions = { cursor: '5', limit: 2, direction: 'next' }
      const result = repository.findAll(options)
      expect(result.data.length).toBe(0)
      expect(result.hasMore).toBe(false)
      expect(result.nextCursor).toBeUndefined()
      expect(result.previousCursor).toBeUndefined()
    })

    it('should return empty array when repository is empty', () => {
      const emptyRepository = new InMemoryCharacterRepository()
      const result = emptyRepository.findAll({ limit: 10, direction: 'next' })
      expect(result.data).toEqual([])
      expect(result.hasMore).toBe(false)
      expect(result.nextCursor).toBeUndefined()
      expect(result.previousCursor).toBeUndefined()
    })

    it('should handle invalid cursor by returning from the start', () => {
      const options: CursorPaginationOptions = { cursor: 'invalid-cursor', limit: 2, direction: 'next' }
      const result = repository.findAll(options)
      expect(result.data.length).toBe(2)
      expect(result.data[0].id).toBe('1')
      expect(result.data[1].id).toBe('2')
      expect(result.hasMore).toBe(true)
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
