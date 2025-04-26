import { BattleableCharacter } from '~shared/domain/interfaces/battleable-character.interface'
import { Job } from '../enums/job.enum'
import type { Stats } from '../value-objects/stats.vo'

interface CreateCharacterParams {
  id: string
  name: string
  job: Job
  stats: Stats
  healthPoints: number
  maxHealthPoints: number
}

export class Character implements BattleableCharacter {
  readonly id: string
  readonly name: string
  readonly job: Job
  readonly stats: Stats
  private _healthPoints: number
  readonly maxHealthPoints: number

  private static readonly ATTACK_MODIFIERS: Record<Job, (stats: Stats) => number> = {
    [Job.Warrior]: (stats) => Math.floor(stats.strength * 0.8 + stats.dexterity * 0.2),
    [Job.Thief]: (stats) => Math.floor(stats.strength * 0.25 + stats.dexterity * 1 + stats.intelligence * 0.25),
    [Job.Mage]: (stats) => Math.floor(stats.strength * 0.2 + stats.dexterity * 0.2 + stats.intelligence * 1.2),
    // Add more jobs and their attack modifiers as needed
  }

  private static readonly SPEED_MODIFIERS: Record<Job, (stats: Stats) => number> = {
    [Job.Warrior]: (stats) => Math.floor(stats.dexterity * 0.6 + stats.intelligence * 0.2),
    [Job.Thief]: (stats) => Math.floor(stats.dexterity * 0.8),
    [Job.Mage]: (stats) => Math.floor(stats.dexterity * 0.4 + stats.strength * 0.1),
    // Add more jobs and their speed modifiers as needed
  }

  private constructor(params: CreateCharacterParams) {
    this.id = params.id
    this.name = params.name
    this.job = params.job
    this.stats = Object.freeze({ ...params.stats })
    this._healthPoints = params.healthPoints
    this.maxHealthPoints = params.maxHealthPoints
  }

  static create(params: CreateCharacterParams): Character {
    if (!params.id) throw new Error('Character ID is required')
    if (!params.name) throw new Error('Character name is required')
    if (!Object.values(Job).includes(params.job)) throw new Error(`Invalid job type: ${params.job}`)
    if (params.maxHealthPoints <= 0) throw new Error('maxHealthPoints must be positive')
    if (params.healthPoints < 0) throw new Error('healthPoints cannot be negative')
    if (params.healthPoints > params.maxHealthPoints) throw new Error('healthPoints cannot exceed maxHealthPoints')
    if (params.stats.strength < 0) throw new Error('stats.strength cannot be negative')
    if (params.stats.dexterity < 0) throw new Error('stats.dexterity cannot be negative')
    if (params.stats.intelligence < 0) throw new Error('stats.intelligence cannot be negative')
    return new Character(params)
  }

  get healthPoints(): number {
    return this._healthPoints
  }

  get isAlive(): boolean {
    return this._healthPoints > 0
  }

  get attackPower(): number {
    return Character.ATTACK_MODIFIERS[this.job](this.stats)
  }

  get speed(): number {
    return Character.SPEED_MODIFIERS[this.job](this.stats)
  }

  calculateAttackModifier(): number {
    return this.attackPower
  }

  calculateSpeedModifier(): number {
    return this.speed
  }

  receiveDamage(damage: number): void {
    if (damage < 0) throw new Error('Damage cannot be negative')
    this._healthPoints = Math.max(0, this._healthPoints - damage)
  }
}
