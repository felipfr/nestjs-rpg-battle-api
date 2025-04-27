import { Module } from '@nestjs/common'
import { BattleModule } from '~battle/battle.module'
import { CharacterModule } from '~character/character.module'

@Module({
  imports: [BattleModule, CharacterModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
