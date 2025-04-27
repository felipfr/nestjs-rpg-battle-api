import { BattleableCharacter } from '~shared/domain/interfaces/battleable-character.interface'

export class BattleCharacter {
  readonly id: string
  readonly name: string
  readonly job: string
  private _healthPoints: number
  readonly maxHealthPoints: number
  readonly attack: number
  readonly speed: number

  constructor(character: BattleableCharacter) {
    this.id = character.id
    this.name = character.name
    this.job = character.job
    this._healthPoints = character.healthPoints
    this.maxHealthPoints = character.maxHealthPoints
    this.attack = character.calculateAttackModifier()
    this.speed = character.calculateSpeedModifier()
  }

  get healthPoints(): number {
    return this._healthPoints
  }

  get isAlive(): boolean {
    return this._healthPoints > 0
  }

  receiveDamage(damage: number): void {
    this._healthPoints = Math.max(0, this._healthPoints - damage)
  }
}
