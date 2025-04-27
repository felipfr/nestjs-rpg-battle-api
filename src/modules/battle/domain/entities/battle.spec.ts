import { BattleFactory } from '~battle/application/factories/battle.factory'
import { Job } from '../../../../modules/character/domain/enums/job.enum'
import { BattleableCharacter } from '../../../shared/domain/interfaces/battleable-character.interface'
import { Battle } from './battle'

describe('Battle', () => {
  let char1: MockCharacter
  let char2: MockCharacter
  let char3Dead: MockCharacter

  beforeEach(() => {
    char1 = new MockCharacter('uuid1', 'Hero', Job.Warrior, 100, 50, 30)
    char2 = new MockCharacter('uuid2', 'Villain', Job.Mage, 80, 60, 25)
    char3Dead = new MockCharacter('uuid3', 'Ghost', Job.Thief, 0, 40, 40)
    char3Dead.isAlive = false
  })

  it('should throw error if characters are not provided', () => {
    expect(() => BattleFactory.create(null as any, char2)).toThrow('Both characters must be provided for a battle.')
    expect(() => BattleFactory.create(char1, null as any)).toThrow('Both characters must be provided for a battle.')
  })

  it('should throw error if a character battles itself', () => {
    expect(() => BattleFactory.create(char1, char1)).toThrow('A character cannot battle itself.')
  })

  it('should throw error if one or both characters are dead', () => {
    expect(() => BattleFactory.create(char1, char3Dead)).toThrow('Both characters must be alive to battle.')
    expect(() => BattleFactory.create(char3Dead, char2)).toThrow('Both characters must be alive to battle.')
  })

  it('should throw error if RNG strategy is not provided when calling Battle.create directly', () => {
    const params = { char1, char2, rng: undefined as any }
    expect(() => Battle.create(params)).toThrow('RNG strategy must be provided.')
  })

  it('should initialize with correct properties', () => {
    const battle = BattleFactory.create(char1, char2)
    expect(battle.id).toBeDefined()
    expect(battle.getBattleResult().winner).toBeNull()
    expect(battle.getBattleResult().loser).toBeNull()
    expect(battle.getBattleResult().log).toBe('')
  })

  it('should simulate a battle until one character is dead', () => {
    char1 = new MockCharacter('uuid1', 'Hero', Job.Warrior, 30, 10, 5)
    char2 = new MockCharacter('uuid2', 'Villain', Job.Mage, 25, 12, 4)
    const battle = BattleFactory.create(char1, char2)
    const result = battle.fight()
    expect(result.winner).toBeDefined()
    expect(result.loser).toBeDefined()
    expect(result.winner?.isAlive).toBe(true)
    expect(result.loser?.isAlive).toBe(false)
    expect(result.winner?.healthPoints).toBeGreaterThan(0)
    expect(result.loser?.healthPoints).toBe(0)
    expect(result.log).toContain('wins the battle!')
    expect(result.log).toContain('HP remaining!')
  })

  it('should generate a battle log in the correct format', () => {
    char1 = new MockCharacter('uuid1', 'Hero', Job.Warrior, 1000, 5, 10)
    char2 = new MockCharacter('uuid2', 'Villain', Job.Mage, 1000, 5, 8)
    const battle = BattleFactory.create(char1, char2)
    const result = battle.fight()
    expect(result.log).toMatch(/^Battle between Hero \(Warrior\) - 1000 HP and Villain \(Mage\) - 1000 HP begins!/)
    expect(result.log).toMatch(/\w+ \d+ speed was faster than \w+ \d+ speed and will begin this round./)
    expect(result.log).toMatch(/\w+ attacks \w+ for \d+, \w+ has \d+ HP remaining./)
    expect(result.log).toMatch(/\w+ wins the battle! \w+ still has \d+ HP remaining!$/)
  })

  it('should handle a one-hit kill scenario', () => {
    char1 = new MockCharacter('uuid1', 'Hero', Job.Warrior, 100, 100, 10)
    char2 = new MockCharacter('uuid2', 'Villain', Job.Mage, 1, 5, 5)
    const battle = BattleFactory.create(char1, char2)
    const result = battle.fight()
    expect(result.winner?.id).toBe(char1.id)
    expect(result.loser?.id).toBe(char2.id)
    expect(result.loser?.healthPoints).toBe(0)
    expect(result.log).toContain('Hero wins the battle!')
  })

  it('should throw error if fight is called after battle concluded', () => {
    const battle = BattleFactory.create(char1, char2)
    battle.fight()
    expect(() => battle.fight()).toThrow('Battle has already concluded.')
  })

  it('getBattleResult should return current state', () => {
    const battle = BattleFactory.create(char1, char2)
    let result = battle.getBattleResult()
    expect(result.winner).toBeNull()
    expect(result.loser).toBeNull()
    expect(result.log).toBe('')
    const finalResult = battle.fight()
    result = battle.getBattleResult()
    expect(result.winner?.id).toBe(finalResult.winner.id)
    expect(result.loser?.id).toBe(finalResult.loser.id)
    expect(result.log).toBe(finalResult.log)
  })

  it('should clone characters to avoid modifying original state during simulation', () => {
    const originalChar1Hp = char1.healthPoints
    const originalChar2Hp = char2.healthPoints
    const battle = BattleFactory.create(char1, char2)
    battle.fight()
    expect(char1.healthPoints).toBe(originalChar1Hp)
    expect(char2.healthPoints).toBe(originalChar2Hp)
    expect(char1.isAlive).toBe(true)
    expect(char2.isAlive).toBe(true)
  })

  it('should provide deterministic battle results with seeded RNG', () => {
    const warriorA = new MockCharacter('id1', 'Warrior A', Job.Warrior, 50, 10, 10)
    const warriorB = new MockCharacter('id2', 'Warrior B', Job.Warrior, 50, 10, 10)
    const battle1 = BattleFactory.createSeeded(warriorA, warriorB, 12345)
    const battle2 = BattleFactory.createSeeded(warriorA, warriorB, 12345)
    const result1 = battle1.fight()
    const result2 = battle2.fight()
    expect(result1.winner.id).toBe(result2.winner.id)
    expect(result1.loser.id).toBe(result2.loser.id)
    expect(result1.log).toBe(result2.log)
  })
})

// MockCharacter class for testing
class MockCharacter implements BattleableCharacter {
  id: string
  name: string
  job: string
  healthPoints: number
  maxHealthPoints: number
  isAlive: boolean
  private readonly attack: number
  private readonly speed: number

  constructor(id: string, name: string, job: string, hp: number, attack: number, speed: number) {
    this.id = id
    this.name = name
    this.job = job
    this.maxHealthPoints = hp
    this.healthPoints = hp
    this.isAlive = hp > 0
    this.attack = attack
    this.speed = speed
  }

  calculateAttackModifier(): number {
    return this.attack
  }

  calculateSpeedModifier(): number {
    return this.speed
  }

  receiveDamage(damage: number): void {
    this.healthPoints = Math.max(0, this.healthPoints - damage)
    if (this.healthPoints === 0) {
      this.isAlive = false
    }
  }
}
