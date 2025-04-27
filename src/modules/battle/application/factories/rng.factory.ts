import { randomInt } from 'crypto'

export type RNGStrategy = (min: number, max: number) => number

/**
 * Returns a linear congruential generator based RNG strategy.
 */
export class RngFactory {
  static createSeeded(seed: number): RNGStrategy {
    let state = seed
    return (min, max) => {
      state = (state * 9301 + 49297) % 233280
      return min + Math.floor((state / 233280) * (max - min))
    }
  }

  static readonly default: RNGStrategy = randomInt
}
