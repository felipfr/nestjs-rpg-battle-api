import { Module } from '@nestjs/common'

import { CreateCharacterCommandHandler } from './application/commands/create-character/create-character.handler'
import { GetCharacterByIdQueryHandler } from './application/queries/get-character-by-id/get-character-by-id.handler'
import { CharacterCreationService } from './application/services/character-creation.service'
import { InMemoryCharacterRepository } from './infra/in-memory-character.repository'
import { CharacterController } from './presentation/character.controller'

@Module({
  controllers: [CharacterController],
  providers: [
    InMemoryCharacterRepository,
    {
      provide: CharacterCreationService,
      useFactory: (repo: InMemoryCharacterRepository) => new CharacterCreationService(repo),
      inject: [InMemoryCharacterRepository],
    },
    {
      provide: GetCharacterByIdQueryHandler,
      useFactory: (repo: InMemoryCharacterRepository) => new GetCharacterByIdQueryHandler(repo),
      inject: [InMemoryCharacterRepository],
    },
    {
      provide: CreateCharacterCommandHandler,
      useFactory: (creationService: CharacterCreationService) => new CreateCharacterCommandHandler(creationService),
      inject: [CharacterCreationService],
    },
  ],
})
export class CharacterModule {}
