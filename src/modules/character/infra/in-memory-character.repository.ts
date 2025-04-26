import { type CursorPaginationOptions, PaginatedResult } from '~shared/application/dtos/cursor-pagination.dto'
import { CharacterRepositoryInterface } from '~shared/domain/interfaces/character-repository.interface'
import type { Character } from '../domain/entities/character'

export class InMemoryCharacterRepository implements CharacterRepositoryInterface {
  private readonly characters = new Map<string, Character>()

  findById(id: string): Character | null {
    return this.characters.get(id) ?? null
  }

  findByName(name: string): Character | null {
    for (const character of this.characters.values()) {
      if (character.name.toLowerCase() === name.toLowerCase()) return character
    }
    return null
  }

  save(character: Character): Character {
    this.characters.set(character.id, character)
    return character
  }

  findAll(options?: CursorPaginationOptions): PaginatedResult<Character> {
    const all = Array.from(this.characters.values())
    if (!options) return new PaginatedResult(all, false)
    const { cursor, limit, direction = 'next' } = options
    let start = 0

    if (cursor) {
      const idx = all.findIndex((c) => c.id === cursor)
      if (idx !== -1) {
        if (direction === 'previous' && idx === 0) {
          return new PaginatedResult([], false)
        }

        const navigationStrategies = {
          next: () => idx + 1,
          previous: () => Math.max(0, idx - limit),
        }

        start = navigationStrategies[direction]()
      }
    }

    const data = all.slice(start, start + limit)
    const nextCursor = data.length ? data[data.length - 1].id : undefined
    const previousCursor = data.length ? data[0].id : undefined
    const hasMore = start + limit < all.length
    return new PaginatedResult(data, hasMore, nextCursor, previousCursor)
  }
}
