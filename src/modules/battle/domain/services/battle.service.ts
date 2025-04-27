import { BattleFactory } from '~battle/application/factories/battle.factory'
import { CharacterNotFoundError } from '~shared/domain/errors/character-not-found.error'
import { CharacterRepositoryInterface } from '../../../shared/domain/interfaces/character-repository.interface'
import { CharacterNotAliveError } from '../errors/character-not-alive.error'
import { SelfBattleError } from '../errors/self-battle.error'

export class BattleService {
  constructor(private readonly characterRepository: CharacterRepositoryInterface) {}

  executeBattle(character1Id: string, character2Id: string): string {
    if (character1Id === character2Id) throw new SelfBattleError(character1Id)

    const character1 = this.characterRepository.findById(character1Id)
    if (!character1) throw new CharacterNotFoundError(character1Id)
    const character2 = this.characterRepository.findById(character2Id)
    if (!character2) throw new CharacterNotFoundError(character2Id)

    if (!character1.isAlive || !character2.isAlive) {
      const notAliveCharacterId = !character1.isAlive ? character1.id : character2.id
      throw new CharacterNotAliveError(notAliveCharacterId)
    }

    const battle = BattleFactory.create(character1, character2)
    const battleResult = battle.fight()
    const loserEntity = this.characterRepository.findById(battleResult.loser.id)

    if (loserEntity) {
      loserEntity.receiveDamage(loserEntity.healthPoints)
      this.characterRepository.save(loserEntity)
    }

    const winnerEntity = this.characterRepository.findById(battleResult.winner.id)

    if (winnerEntity) {
      const damageTakenByWinner = winnerEntity.maxHealthPoints - battleResult.winner.healthPoints
      winnerEntity.receiveDamage(damageTakenByWinner)
      this.characterRepository.save(winnerEntity)
    }

    return battleResult.log
  }
}
