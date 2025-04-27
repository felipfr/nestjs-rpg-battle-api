import { BattleService } from '../../../domain/services/battle.service'
import type { StartBattleCommand } from './start-battle.command'

export class StartBattleHandler {
  constructor(private readonly battleService: BattleService) {}

  handle(command: StartBattleCommand): string {
    const { character1Id, character2Id } = command
    return this.battleService.executeBattle(character1Id, character2Id)
  }
}
