import { BattleFactory } from '~battle/application/factories/battle.factory'
import { CharacterNotFoundError } from '~shared/domain/errors/character-not-found.error'
import { CharacterRepositoryInterface } from '~shared/domain/interfaces/character-repository.interface'
import { CharacterNotAliveError } from '../errors/character-not-alive.error'
import { SelfBattleError } from '../errors/self-battle.error'
import { BattleService } from './battle.service'

jest.mock('~battle/application/factories/battle.factory', () => ({
  BattleFactory: { create: jest.fn(), createSeeded: jest.fn() },
}))

interface ICharacter {
  id: string
  name: string
  job: string
  healthPoints: number
  maxHealthPoints: number
  stats: { strength: number; dexterity: number; intelligence: number }
  isAlive: boolean
  calculateAttackModifier: () => number
  calculateSpeedModifier: () => number
  receiveDamage: (damage: number) => void
}

describe('BattleService', () => {
  let service: BattleService
  let character1: ICharacter
  let character2: ICharacter
  let deadCharacter: ICharacter
  let mockBattleInstance: any

  beforeEach(() => {
    jest.clearAllMocks()
    service = new BattleService(mockCharacterRepository)

    character1 = {
      id: 'char1-id',
      name: 'Warrior',
      job: 'Warrior',
      healthPoints: 20,
      maxHealthPoints: 20,
      stats: { strength: 10, dexterity: 5, intelligence: 5 },
      isAlive: true,
      calculateAttackModifier: jest.fn().mockReturnValue(2),
      calculateSpeedModifier: jest.fn().mockReturnValue(1.5),
      receiveDamage: jest.fn(),
    }

    character2 = {
      id: 'char2-id',
      name: 'Mage',
      job: 'Mage',
      healthPoints: 12,
      maxHealthPoints: 12,
      stats: { strength: 5, dexterity: 6, intelligence: 10 },
      isAlive: true,
      calculateAttackModifier: jest.fn().mockReturnValue(1),
      calculateSpeedModifier: jest.fn().mockReturnValue(2.2),
      receiveDamage: jest.fn(),
    }

    deadCharacter = {
      id: 'dead-char-id',
      name: 'DeadCharacter',
      job: 'Thief',
      healthPoints: 0,
      maxHealthPoints: 15,
      stats: { strength: 4, dexterity: 10, intelligence: 4 },
      isAlive: false,
      calculateAttackModifier: jest.fn().mockReturnValue(1.5),
      calculateSpeedModifier: jest.fn().mockReturnValue(3),
      receiveDamage: jest.fn(),
    }

    mockCharacterRepository.findById.mockImplementation((id) => {
      if (id === 'char1-id') return character1 as any
      if (id === 'char2-id') return character2 as any
      if (id === 'dead-char-id') return deadCharacter as any
      return null
    })

    mockBattleInstance = { fight: jest.fn() }
    ;(BattleFactory.create as jest.Mock).mockReturnValue(mockBattleInstance)
  })

  it('should throw SelfBattleError if a character tries to battle itself', () => {
    expect(() => service.executeBattle('char1-id', 'char1-id')).toThrow(SelfBattleError)
  })

  it('should throw CharacterNotFoundError if character1 is not found', () => {
    expect(() => service.executeBattle('not-found-id', 'char2-id')).toThrow(CharacterNotFoundError)
    expect(mockCharacterRepository.findById).toHaveBeenCalledWith('not-found-id')
  })

  it('should throw CharacterNotFoundError if character2 is not found', () => {
    expect(() => service.executeBattle('char1-id', 'not-found-id')).toThrow(CharacterNotFoundError)
    expect(mockCharacterRepository.findById).toHaveBeenCalledWith('not-found-id')
  })

  it('should throw CharacterNotAliveError with the default message when no characterId is provided', () => {
    const error = new CharacterNotAliveError()
    expect(error.message).toBe('One or both characters must be alive to battle.')
    expect(error.name).toBe('CharacterNotAliveError')
  })

  it('should throw CharacterNotAliveError if character1 is dead', () => {
    expect(() => service.executeBattle('dead-char-id', 'char2-id')).toThrow(CharacterNotAliveError)
    expect(() => service.executeBattle('dead-char-id', 'char2-id')).toThrow(
      expect.objectContaining({
        message: expect.stringContaining('dead-char-id'),
      }),
    )
  })

  it('should throw CharacterNotAliveError if character2 is dead', () => {
    expect(() => service.executeBattle('char1-id', 'dead-char-id')).toThrow(CharacterNotAliveError)
    expect(() => service.executeBattle('char1-id', 'dead-char-id')).toThrow(
      expect.objectContaining({
        message: expect.stringContaining('dead-char-id'),
      }),
    )
  })

  it('should execute battle, update loser and winner, and return battle log when character1 wins', () => {
    const winnerRemainingHp = 10
    const battleLog = `
Battle between Warrior (Warrior) - 20 HP and Mage (Mage) - 12 HP begins!
Warrior 1.5 speed was faster than Mage 2.2 speed and will begin this round.
Warrior attacks Mage for 7 damage, Mage has 5 HP remaining.
Mage attacks Warrior for 5 damage, Warrior has 15 HP remaining.
Mage 2.2 speed was faster than Warrior 1.5 speed and will begin this round.
Mage attacks Warrior for 5 damage, Warrior has ${winnerRemainingHp} HP remaining.
Warrior attacks Mage for 7 damage, Mage has 0 HP remaining.
Warrior wins the battle! Warrior still has ${winnerRemainingHp} HP remaining!
    `.trim()

    const mockWinnerState = { ...character1, healthPoints: winnerRemainingHp }
    mockBattleInstance.fight.mockReturnValue({ winner: mockWinnerState, loser: character2, log: battleLog })
    const result = service.executeBattle('char1-id', 'char2-id')
    expect(BattleFactory.create).toHaveBeenCalledWith(character1, character2)
    expect(mockBattleInstance.fight).toHaveBeenCalled()

    expect(mockCharacterRepository.findById).toHaveBeenCalledWith('char2-id')
    expect(character2.receiveDamage).toHaveBeenCalledWith(character2.maxHealthPoints)
    expect(mockCharacterRepository.save).toHaveBeenCalledWith(character2)
    expect(mockCharacterRepository.findById).toHaveBeenCalledWith('char1-id')
    const damageTakenByWinner = character1.maxHealthPoints - winnerRemainingHp
    expect(character1.receiveDamage).toHaveBeenCalledWith(damageTakenByWinner)
    expect(mockCharacterRepository.save).toHaveBeenCalledWith(character1)

    expect(result).toBe(battleLog)
    expect(result).toContain(`Battle between Warrior (Warrior) - 20 HP and Mage (Mage) - 12 HP begins!`)
    expect(result).toMatch(/\w+ \d+(\.\d+)? speed was faster than \w+ \d+(\.\d+)? speed and will begin this round\./)
    expect(result).toMatch(/\w+ attacks \w+ for \d+ damage, \w+ has \d+ HP remaining\./)
    expect(result).toMatch(/Warrior wins the battle! Warrior still has 10 HP remaining!/)
  })

  it('should execute battle, update loser and winner, and return battle log when character2 wins', () => {
    const winnerRemainingHp = 7
    const battleLog = `
Battle between Warrior (Warrior) - 20 HP and Mage (Mage) - 12 HP begins!
Mage 2.2 speed was faster than Warrior 1.5 speed and will begin this round.
Mage attacks Warrior for 8 damage, Warrior has 12 HP remaining.
Warrior attacks Mage for 5 damage, Mage has ${winnerRemainingHp} HP remaining.
Mage 2.2 speed was faster than Warrior 1.5 speed and will begin this round.
Mage attacks Warrior for 12 damage, Warrior has 0 HP remaining.
Mage wins the battle! Mage still has ${winnerRemainingHp} HP remaining!
    `.trim()

    const mockWinnerState = { ...character2, healthPoints: winnerRemainingHp }
    mockBattleInstance.fight.mockReturnValue({ winner: mockWinnerState, loser: character1, log: battleLog })
    const result = service.executeBattle('char1-id', 'char2-id')
    expect(BattleFactory.create).toHaveBeenCalledWith(character1, character2)
    expect(mockBattleInstance.fight).toHaveBeenCalled()

    expect(mockCharacterRepository.findById).toHaveBeenCalledWith('char1-id')
    expect(character1.receiveDamage).toHaveBeenCalledWith(character1.maxHealthPoints)
    expect(mockCharacterRepository.save).toHaveBeenCalledWith(character1)
    expect(mockCharacterRepository.findById).toHaveBeenCalledWith('char2-id')
    const damageTakenByWinner = character2.maxHealthPoints - winnerRemainingHp
    expect(character2.receiveDamage).toHaveBeenCalledWith(damageTakenByWinner)
    expect(mockCharacterRepository.save).toHaveBeenCalledWith(character2)

    expect(result).toBe(battleLog)
    expect(result).toContain(`Battle between Warrior (Warrior) - 20 HP and Mage (Mage) - 12 HP begins!`)
    expect(result).toMatch(/\w+ \d+(\.\d+)? speed was faster than \w+ \d+(\.\d+)? speed and will begin this round\./)
    expect(result).toMatch(/\w+ attacks \w+ for \d+ damage, \w+ has \d+ HP remaining\./)
    expect(result).toMatch(/Mage wins the battle! Mage still has 7 HP remaining!/)
  })

  it('should include specific patterns in battle log as per business requirements', () => {
    const battleLog = `
Battle between Warrior (Warrior) - 20 HP and Mage (Mage) - 12 HP begins!
Mage 2.2 speed was faster than Warrior 1.5 speed and will begin this round.
Mage attacks Warrior for 8 damage, Warrior has 12 HP remaining.
Warrior attacks Mage for 5 damage, Mage has 7 HP remaining.
Mage wins the battle! Mage still has 7 HP remaining!
    `.trim()

    mockBattleInstance.fight.mockReturnValue({ winner: character2, loser: character1, log: battleLog })
    const result = service.executeBattle('char1-id', 'char2-id')
    const lines = result.split('\n')
    expect(lines[0]).toMatch(/Battle between \w+ \(\w+\) - \d+ HP and \w+ \(\w+\) - \d+ HP begins!/)
    expect(lines[1]).toMatch(/\w+ \d+(\.\d+)? speed was faster than \w+ \d+(\.\d+)? speed and will begin this round\./)
    expect(lines[2]).toMatch(/\w+ attacks \w+ for \d+ damage, \w+ has \d+ HP remaining\./)
    expect(lines[lines.length - 1]).toMatch(/\w+ wins the battle! \w+ still has \d+ HP remaining!/)
  })
})

// Mock Character Repository
const mockCharacterRepository: jest.Mocked<CharacterRepositoryInterface> = {
  findById: jest.fn(),
  findByName: jest.fn(),
  save: jest.fn(),
  findAll: jest.fn(),
}
