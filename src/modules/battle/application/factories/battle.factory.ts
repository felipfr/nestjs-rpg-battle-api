import { randomInt } from 'crypto'

import { Battle } from '~battle/domain/entities/battle'
import { BattleableCharacter } from '~shared/domain/interfaces/battleable-character.interface'
import type { RNGStrategy } from './rng.factory'

export class BattleFactory {
  /**
   * Creates a new battle instance between two characters.
   * Optionally accepts a custom RNG strategy for battle calculations.
   *
   * @param char1 First character participating in the battle
   * @param char2 Second character participating in the battle
   * @param rng Optional random number generator strategy (defaults to crypto.randomInt)
   * @returns A new Battle instance
   */
  static create(char1: BattleableCharacter, char2: BattleableCharacter, rng: RNGStrategy = randomInt): Battle {
    return Battle.create({ char1, char2, rng })
  }

  /**
   * Creates a battle with predefined seed for deterministic outcomes.
   * Useful for testing or replaying specific battle scenarios.
   *
   * @param char1 First character participating in the battle
   * @param char2 Second character participating in the battle
   * @param seed Numeric seed for the random number generator
   * @returns A new Battle instance with seeded RNG
   */
  static createSeeded(char1: BattleableCharacter, char2: BattleableCharacter, seed: number): Battle {
    let state = seed
    const seededRng: RNGStrategy = (min, max) => {
      state = (state * 9301 + 49297) % 233280
      return min + Math.floor((state / 233280) * (max - min))
    }
    return Battle.create({ char1, char2, rng: seededRng })
  }
}
