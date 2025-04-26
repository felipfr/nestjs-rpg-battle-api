import { Job } from '../enums/job.enum'
import { Character } from './character'

describe('Character Model', () => {
  describe('calculateAttackModifier / attackPower getter', () => {
    it('should calculate correct attack modifier for Warrior', () => {
      const warrior = createCharacter(Job.Warrior, 10, 5, 5)
      expect(warrior.calculateAttackModifier()).toBe(warrior.attackPower)
      // 80% of strength + 20% of dexterity = 0.8*10 + 0.2*5 = 8 + 1 = 9
      expect(warrior.attackPower).toBe(9)
    })

    it('should calculate correct attack modifier for Thief', () => {
      const thief = createCharacter(Job.Thief, 4, 10, 4)
      expect(thief.calculateAttackModifier()).toBe(thief.attackPower)
      // 25% of strength + 100% of dexterity + 25% of intelligence = 1 + 10 + 1 = 12
      expect(thief.attackPower).toBe(12)
    })

    it('should calculate correct attack modifier for Mage', () => {
      const mage = createCharacter(Job.Mage, 5, 6, 10)
      expect(mage.calculateAttackModifier()).toBe(mage.attackPower)
      // 0.2*5 + 0.2*6 + 1.2*10 = 1 + 1.2 + 12 = 14.2 => 14
      expect(mage.attackPower).toBe(14)
    })
  })

  describe('calculateSpeedModifier / speed getter', () => {
    it('should calculate correct speed modifier for Warrior', () => {
      const warrior = createCharacter(Job.Warrior, 10, 5, 5)
      expect(warrior.calculateSpeedModifier()).toBe(warrior.speed)
      // 0.6*5 + 0.2*5 = 3 + 1 = 4
      expect(warrior.speed).toBe(4)
    })

    it('should calculate correct speed modifier for Thief', () => {
      const thief = createCharacter(Job.Thief, 4, 10, 4)
      expect(thief.calculateSpeedModifier()).toBe(thief.speed)
      // 0.8*10 = 8
      expect(thief.speed).toBe(8)
    })

    it('should calculate correct speed modifier for Mage', () => {
      const mage = createCharacter(Job.Mage, 5, 6, 10)
      expect(mage.calculateSpeedModifier()).toBe(mage.speed)
      // 0.4*6 + 0.1*5 = 2.4 + 0.5 = 2.9 => 2
      expect(mage.speed).toBe(2)
    })
  })

  describe('receiveDamage and isAlive', () => {
    it('should reduce health when receiving damage', () => {
      const character = createCharacter(Job.Warrior, 10, 5, 5)
      const initialHP = character.healthPoints
      character.receiveDamage(5)
      expect(character.healthPoints).toBe(initialHP - 5)
      expect(character.isAlive).toBe(true)
    })

    it('should set health to 0 and isAlive to false when damage exceeds health', () => {
      const character = createCharacter(Job.Warrior, 10, 5, 5)
      character.receiveDamage(character.healthPoints + 10)
      expect(character.healthPoints).toBe(0)
      expect(character.isAlive).toBe(false)
    })

    it('should throw error on negative damage', () => {
      const character = createCharacter(Job.Mage, 5, 5, 5)
      expect(() => character.receiveDamage(-1)).toThrow('Damage cannot be negative')
    })
  })

  describe('create method validations', () => {
    it('should throw error if id is missing', () => {
      expect(() =>
        Character.create({
          id: '',
          name: 'Test',
          job: Job.Warrior,
          stats: { strength: 10, dexterity: 5, intelligence: 5 },
          healthPoints: 20,
          maxHealthPoints: 20,
        }),
      ).toThrow('Character ID is required')
    })

    it('should throw error if name is missing', () => {
      expect(() =>
        Character.create({
          id: '1',
          name: '',
          job: Job.Warrior,
          stats: { strength: 10, dexterity: 5, intelligence: 5 },
          healthPoints: 20,
          maxHealthPoints: 20,
        }),
      ).toThrow('Character name is required')
    })

    it('should throw error if job is invalid', () => {
      expect(() =>
        Character.create({
          id: '1',
          name: 'Test',
          job: 'InvalidJob' as Job,
          stats: { strength: 10, dexterity: 5, intelligence: 5 },
          healthPoints: 20,
          maxHealthPoints: 20,
        }),
      ).toThrow('Invalid job type: InvalidJob')
    })

    it('should throw error if maxHealthPoints is not positive', () => {
      expect(() =>
        Character.create({
          id: '1',
          name: 'Test',
          job: Job.Warrior,
          stats: { strength: 10, dexterity: 5, intelligence: 5 },
          healthPoints: 0,
          maxHealthPoints: 0,
        }),
      ).toThrow('maxHealthPoints must be positive')
    })

    it('should throw error if healthPoints is negative', () => {
      expect(() =>
        Character.create({
          id: '1',
          name: 'Test',
          job: Job.Warrior,
          stats: { strength: 10, dexterity: 5, intelligence: 5 },
          healthPoints: -1,
          maxHealthPoints: 20,
        }),
      ).toThrow('healthPoints cannot be negative')
    })

    it('should throw error if healthPoints exceeds maxHealthPoints', () => {
      expect(() =>
        Character.create({
          id: '1',
          name: 'Test',
          job: Job.Warrior,
          stats: { strength: 10, dexterity: 5, intelligence: 5 },
          healthPoints: 25,
          maxHealthPoints: 20,
        }),
      ).toThrow('healthPoints cannot exceed maxHealthPoints')
    })

    it('should throw error if stats.strength is negative', () => {
      expect(() =>
        Character.create({
          id: '1',
          name: 'Test',
          job: Job.Warrior,
          stats: { strength: -1, dexterity: 5, intelligence: 5 },
          healthPoints: 20,
          maxHealthPoints: 20,
        }),
      ).toThrow('stats.strength cannot be negative')
    })

    it('should throw error if stats.dexterity is negative', () => {
      expect(() =>
        Character.create({
          id: '1',
          name: 'Test',
          job: Job.Warrior,
          stats: { strength: 10, dexterity: -1, intelligence: 5 },
          healthPoints: 20,
          maxHealthPoints: 20,
        }),
      ).toThrow('stats.dexterity cannot be negative')
    })

    it('should throw error if stats.intelligence is negative', () => {
      expect(() =>
        Character.create({
          id: '1',
          name: 'Test',
          job: Job.Warrior,
          stats: { strength: 10, dexterity: 5, intelligence: -1 },
          healthPoints: 20,
          maxHealthPoints: 20,
        }),
      ).toThrow('stats.intelligence cannot be negative')
    })
  })

  describe('constructor and immutability', () => {
    it('should freeze stats to prevent modification', () => {
      const initialStats = { strength: 10, dexterity: 5, intelligence: 5 }
      const character = Character.create({
        id: '1',
        name: 'Test',
        job: Job.Warrior,
        stats: initialStats,
        healthPoints: 20,
        maxHealthPoints: 20,
      })
      expect(() => {
        ;(character.stats as any).strength = 15
      }).toThrow()
      expect(character.stats).toEqual(initialStats)
    })
  })

  // Helper functions
  function createCharacter(job: Job, strength: number, dexterity: number, intelligence: number): Character {
    return Character.create({
      id: '1',
      name: 'Test',
      job,
      stats: { strength, dexterity, intelligence },
      healthPoints: 20,
      maxHealthPoints: 20,
    })
  }
})
