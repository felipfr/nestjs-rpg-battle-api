import { randomUUID } from 'crypto'

/**
 * Using randomUUID in the domain layer is not ideal - in a proper architecture,
 * ID generation should be handled by the repository/infrastructure layer.
 * This is kept here for simplicity in this proof of concept implementation.
 */

import type { RNGStrategy } from '~battle/application/factories/rng.factory'
import { BattleableCharacter } from '~shared/domain/interfaces/battleable-character.interface'
import { BattleAlreadyConcludedError } from '../errors/battle-already-concluded.error'
import { BattleCharacter } from '../value-objects/battle-character.vo'

interface RoundLog {
  roundNumber: number
  firstAttacker: string
  firstAttackerSpeed: number
  secondAttackerSpeed: number
  turns: TurnLog[]
}

interface TurnLog {
  attackerName: string
  defenderName: string
  damageDealt: number
  defenderHpRemaining: number
}

interface CreateBattleParams {
  char1: BattleableCharacter
  char2: BattleableCharacter
  rng: RNGStrategy
}

export class Battle {
  private log: string = ''
  private loser: BattleCharacter | null = null
  private readonly character1: BattleCharacter
  private readonly character2: BattleCharacter
  private readonly rng: RNGStrategy
  private readonly rounds: RoundLog[] = []
  private winner: BattleCharacter | null = null
  readonly id: string

  private constructor(params: CreateBattleParams) {
    this.id = randomUUID()
    this.character1 = new BattleCharacter(params.char1)
    this.character2 = new BattleCharacter(params.char2)
    this.rng = params.rng
  }

  static create(params: CreateBattleParams): Battle {
    if (!params.char1 || !params.char2) throw new Error('Both characters must be provided for a battle.')
    if (params.char1.id === params.char2.id) throw new Error('A character cannot battle itself.')
    if (!params.char1.isAlive || !params.char2.isAlive) throw new Error('Both characters must be alive to battle.')
    if (!params.rng) throw new Error('RNG strategy must be provided.')
    return new Battle(params)
  }

  private determineTurnOrder(): [BattleCharacter, BattleCharacter, number, number] {
    let s1: number, s2: number
    do {
      s1 = this.rng(0, this.character1.speed + 1)
      s2 = this.rng(0, this.character2.speed + 1)
    } while (s1 === s2)
    return s1 > s2 ? [this.character1, this.character2, s1, s2] : [this.character2, this.character1, s2, s1]
  }

  private executeTurn(attacker: BattleCharacter, defender: BattleCharacter): TurnLog {
    const damage = this.rng(0, attacker.attack + 1)
    defender.receiveDamage(damage)
    return {
      attackerName: attacker.name,
      defenderName: defender.name,
      damageDealt: damage,
      defenderHpRemaining: defender.healthPoints,
    }
  }

  private generateLog(): string {
    let logContent = `Battle between ${this.character1.name} (${this.character1.job}) - ${this.character1.maxHealthPoints} HP and ${this.character2.name} (${this.character2.job}) - ${this.character2.maxHealthPoints} HP begins!\n`

    this.rounds.forEach((round) => {
      const other = round.firstAttacker === this.character1.name ? this.character2.name : this.character1.name
      logContent += `${round.firstAttacker} ${round.firstAttackerSpeed} speed was faster than ${other} ${round.secondAttackerSpeed} speed and will begin this round.\n`
      round.turns.forEach((turn) => {
        logContent += `${turn.attackerName} attacks ${turn.defenderName} for ${turn.damageDealt}, ${turn.defenderName} has ${turn.defenderHpRemaining} HP remaining.\n`
      })
    })

    if (this.winner && this.loser) {
      logContent += `${this.winner.name} wins the battle! ${this.winner.name} still has ${this.winner.healthPoints} HP remaining!`
    }

    return logContent.trim()
  }

  fight(): { winner: BattleCharacter; loser: BattleCharacter; log: string } {
    if (this.winner || this.loser) throw new BattleAlreadyConcludedError()

    let round = 1
    while (this.character1.isAlive && this.character2.isAlive) {
      const [first, second, s1, s2] = this.determineTurnOrder()
      this.rounds.push({
        roundNumber: round++,
        firstAttacker: first.name,
        firstAttackerSpeed: s1,
        secondAttackerSpeed: s2,
        turns: [this.executeTurn(first, second), ...(second.isAlive ? [this.executeTurn(second, first)] : [])],
      })
    }

    this.winner = this.character1.isAlive ? this.character1 : this.character2
    this.loser = this.character1.isAlive ? this.character2 : this.character1
    this.log = this.generateLog()
    return { winner: this.winner, loser: this.loser, log: this.log }
  }

  getBattleResult(): { winner: BattleCharacter | null; loser: BattleCharacter | null; log: string } {
    return { winner: this.winner, loser: this.loser, log: this.log }
  }
}
