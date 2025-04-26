import { ListCharacterDto } from '~character/application/dto/list-character.dto'
import { InvalidCursorError } from '~character/domain/errors'
import type { PaginatedResult } from '~shared/application/dtos/cursor-pagination.dto'
import type { CharacterRepositoryInterface } from '~shared/domain/interfaces/character-repository.interface'
import { ListCharactersQuery } from './list-characters.query'

export class ListCharactersQueryHandler {
  constructor(private readonly characterRepository: CharacterRepositoryInterface) {}

  execute(query: ListCharactersQuery): PaginatedResult<ListCharacterDto> {
    if (query.cursor) {
      const exists = this.characterRepository.findById(query.cursor)
      if (!exists) throw new InvalidCursorError(query.cursor)
    }

    const result = this.characterRepository.findAll({
      cursor: query.cursor,
      limit: query.limit,
      direction: query.direction,
    })

    return new (result.constructor as typeof PaginatedResult)(
      result.data.map(
        (character) => new ListCharacterDto(character.id, character.name, character.job, character.isAlive),
      ),
      result.hasMore,
      result.nextCursor,
      result.previousCursor,
    )
  }
}
