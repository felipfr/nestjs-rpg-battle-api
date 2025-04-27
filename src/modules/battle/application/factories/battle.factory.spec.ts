import { randomInt } from 'crypto'
import { Battle } from '~battle/domain/entities/battle'
import { BattleFactory } from './battle.factory'
import type { RNGStrategy } from './rng.factory'

jest.mock('crypto', () => ({ randomInt: jest.fn() }))
jest.mock('~battle/domain/entities/battle', () => ({
  Battle: { create: jest.fn() },
}))

describe('BattleFactory', () => {
  const MockJob = { Warrior: 'Warrior', Thief: 'Thief', Mage: 'Mage' }

  const mockChar1 = {
    id: 'char-1',
    name: 'Hero',
    job: MockJob.Warrior,
    healthPoints: 100,
    maxHealthPoints: 100,
    stats: { strength: 20, dexterity: 15, intelligence: 10 },
    isAlive: true,
    attackPower: 18,
    speed: 10,
    calculateAttackModifier: jest.fn().mockReturnValue(18),
    calculateSpeedModifier: jest.fn().mockReturnValue(10),
    receiveDamage: jest.fn(),
  }

  const mockChar2 = {
    id: 'char-2',
    name: 'Enemy',
    job: MockJob.Thief,
    healthPoints: 80,
    maxHealthPoints: 80,
    stats: { strength: 15, dexterity: 25, intelligence: 12 },
    isAlive: true,
    attackPower: 30,
    speed: 20,
    calculateAttackModifier: jest.fn().mockReturnValue(30),
    calculateSpeedModifier: jest.fn().mockReturnValue(20),
    receiveDamage: jest.fn(),
  }

  const mockBattle = { id: 'battle-123' }

  beforeEach(() => {
    jest.clearAllMocks()
    ;(Battle.create as jest.Mock).mockReturnValue(mockBattle)
  })

  describe('create', () => {
    it('should create a battle with the provided characters and default RNG', () => {
      const result = BattleFactory.create(mockChar1, mockChar2)
      expect(Battle.create).toHaveBeenCalledWith({ char1: mockChar1, char2: mockChar2, rng: randomInt })
      expect(result).toBe(mockBattle)
    })

    it('should create a battle with a custom RNG strategy if provided', () => {
      const customRng: RNGStrategy = jest.fn()
      const result = BattleFactory.create(mockChar1, mockChar2, customRng)
      expect(Battle.create).toHaveBeenCalledWith({ char1: mockChar1, char2: mockChar2, rng: customRng })
      expect(result).toBe(mockBattle)
    })
  })

  describe('createSeeded', () => {
    let capturedRng1: RNGStrategy
    let capturedRng2: RNGStrategy

    const setupRngCapture = () => {
      capturedRng1 = () => 0
      capturedRng2 = () => 0
      ;(Battle.create as jest.Mock)
        .mockImplementationOnce(({ rng }) => {
          capturedRng1 = rng
          return { id: 'battle-1' }
        })
        .mockImplementationOnce(({ rng }) => {
          capturedRng2 = rng
          return { id: 'battle-2' }
        })
    }

    it('should create a battle with a seeded RNG strategy', () => {
      const result = BattleFactory.createSeeded(mockChar1, mockChar2, 12345)
      expect(Battle.create).toHaveBeenCalled()
      expect(Battle.create).toHaveBeenCalledWith(
        expect.objectContaining({ char1: mockChar1, char2: mockChar2, rng: expect.any(Function) }),
      )
      expect(result).toBe(mockBattle)
    })

    it('should create deterministic battles with the same seed', () => {
      setupRngCapture()
      BattleFactory.createSeeded(mockChar1, mockChar2, 789)
      BattleFactory.createSeeded(mockChar1, mockChar2, 789)
      const result1 = capturedRng1(1, 100)
      const result2 = capturedRng2(1, 100)
      expect(result1).toBe(result2)
    })

    it('should create different battle outcomes with different seeds', () => {
      setupRngCapture()
      BattleFactory.createSeeded(mockChar1, mockChar2, 123)
      BattleFactory.createSeeded(mockChar1, mockChar2, 456)
      const result1 = capturedRng1(1, 100)
      const result2 = capturedRng2(1, 100)
      expect(result1).not.toBe(result2)
    })
  })
})
