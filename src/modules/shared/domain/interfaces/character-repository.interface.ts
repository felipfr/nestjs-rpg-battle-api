import type { Character } from '../../../character/domain/entities/character'
import { type CursorPaginationOptions, PaginatedResult } from '../../application/dtos/cursor-pagination.dto'

/* istanbul ignore next */
export const CHARACTER_REPOSITORY_TOKEN = 'CharacterRepositoryInterface'

export interface CharacterRepositoryInterface {
  findById(id: string): Character | null
  findByName(name: string): Character | null
  save(character: Character): Character
  findAll(options?: CursorPaginationOptions): PaginatedResult<Character>
}
