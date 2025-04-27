import { randomUUID } from 'crypto'

/**
 * Using randomUUID in the application layer is not ideal - in a proper architecture,
 * ID generation should be handled by the repository/infrastructure layer.
 * This is kept here for simplicity in this proof of concept implementation.
 */

import { Job } from '~character/domain/enums/job.enum'
import { CharacterRepositoryInterface } from '~shared/domain/interfaces/character-repository.interface'
import { Character } from '../../domain/entities/character'
import { DuplicateCharacterNameError } from '../../domain/errors/duplicate-character-name.error'

export class CharacterCreationService {
  private readonly JOB_BASE_STATS: Record<
    Job,
    { healthPoints: number; maxHealthPoints: number; strength: number; dexterity: number; intelligence: number }
  > = {
    Warrior: { healthPoints: 20, maxHealthPoints: 20, strength: 10, dexterity: 5, intelligence: 5 },
    Thief: { healthPoints: 15, maxHealthPoints: 15, strength: 4, dexterity: 10, intelligence: 4 },
    Mage: { healthPoints: 12, maxHealthPoints: 12, strength: 5, dexterity: 6, intelligence: 10 },
  }

  constructor(private readonly repository: CharacterRepositoryInterface) {}

  create(name: string, job: Job): Character {
    this.validateNameUniqueness(name)

    const baseStats = this.getBaseStats(job)
    const character = Character.create({
      id: randomUUID(),
      name,
      job,
      healthPoints: baseStats.healthPoints,
      maxHealthPoints: baseStats.maxHealthPoints,
      stats: { strength: baseStats.strength, dexterity: baseStats.dexterity, intelligence: baseStats.intelligence },
    })

    return this.repository.save(character)
  }

  private validateNameUniqueness(name: string): void {
    const existingCharacter = this.repository.findByName(name)
    if (existingCharacter) throw new DuplicateCharacterNameError(name)
  }

  private getBaseStats(job: Job) {
    return this.JOB_BASE_STATS[job]
  }
}
