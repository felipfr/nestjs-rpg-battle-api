import { Module } from '@nestjs/common'
import { CharacterModule } from '~character/character.module'

/*
 * This import solely wires up the DI infrastructure.
 * The domain’s core logic and use-case handlers remain
 * entirely framework-agnostic and unaffected by Nest.
 */

import { CHARACTER_REPOSITORY_TOKEN } from '../shared/domain/interfaces/character-repository.interface'
import { StartBattleHandler } from './application/commands/start-battle/start-battle.handler'
import { BattleService } from './domain/services/battle.service'
import { BattleController } from './presentation/battle.controller'

@Module({
  imports: [CharacterModule],
  controllers: [BattleController],
  providers: [
    {
      provide: BattleService,
      useFactory: (characterRepo) => new BattleService(characterRepo),
      inject: [CHARACTER_REPOSITORY_TOKEN],
    },
    {
      provide: StartBattleHandler,
      useFactory: (battleService) => new StartBattleHandler(battleService),
      inject: [BattleService],
    },
  ],
})
export class BattleModule {}
