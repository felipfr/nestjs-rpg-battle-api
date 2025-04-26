import { type CursorPaginationOptions, PaginatedResult } from '~shared/application/dtos/cursor-pagination.dto'
import { CursorPaginationHelper } from '~shared/application/helpers/cursor-pagination.helper'
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
    return CursorPaginationHelper.paginate(all, options)
  }
}
