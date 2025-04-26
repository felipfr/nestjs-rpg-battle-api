import { CharacterDto } from '~character/application/dto/character.dto'
import { CharacterCreationService } from '~character/application/services/character-creation.service'
import type { CreateCharacterCommand } from './create-character.command'

export class CreateCharacterCommandHandler {
  constructor(private readonly creationService: CharacterCreationService) {}

  execute(command: CreateCharacterCommand): CharacterDto {
    const character = this.creationService.create(command.name, command.job)
    return CharacterDto.fromDomain(character)
  }
}
