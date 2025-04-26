import type { Character } from '~character/domain/entities/character'
import { Job } from '~character/domain/enums/job.enum'
import type { Stats } from '~character/domain/value-objects/stats.vo'

export class CharacterDto {
  id: string
  name: string
  job: Job
  healthPoints: number
  maxHealthPoints: number
  stats: Stats
  isAlive: boolean
  attackModifier: number
  speedModifier: number

  static fromDomain(character: Character): CharacterDto {
    const dto = new CharacterDto()
    Object.assign(dto, {
      id: character.id,
      name: character.name,
      job: character.job,
      isAlive: character.isAlive,
      healthPoints: character.healthPoints,
      maxHealthPoints: character.maxHealthPoints,
      attackModifier: character.calculateAttackModifier(),
      speedModifier: character.calculateSpeedModifier(),
      stats: character.stats,
    })
    return dto
  }
}
