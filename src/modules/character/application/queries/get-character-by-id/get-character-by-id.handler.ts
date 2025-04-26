import { CharacterDto } from '~character/application/dto/character.dto'
import { CharacterNotFoundError } from '~character/domain/errors'
import { CharacterRepositoryInterface } from '~shared/domain/interfaces/character-repository.interface'
import type { GetCharacterByIdQuery } from './get-character-by-id.query'

export class GetCharacterByIdQueryHandler {
  constructor(private readonly repository: CharacterRepositoryInterface) {}

  execute(query: GetCharacterByIdQuery): CharacterDto {
    const character = this.repository.findById(query.id)
    if (!character) throw new CharacterNotFoundError(query.id)
    return CharacterDto.fromDomain(character)
  }
}
