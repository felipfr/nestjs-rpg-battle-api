import { Module } from '@nestjs/common'

import { BattleModule } from '~battle/battle.module'
import { CharacterModule } from '~character/character.module'
import { SharedModule } from '~shared/shared.module'

@Module({
  imports: [BattleModule, CharacterModule, SharedModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
