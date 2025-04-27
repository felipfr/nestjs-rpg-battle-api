import { randomInt } from 'crypto'
import { RngFactory } from './rng.factory'

jest.mock('crypto', () => ({ randomInt: jest.fn() }))

describe('RngFactory', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('createSeeded', () => {
    it('should create a deterministic RNG function with the given seed', () => {
      const seed = 12345
      const min = 1
      const max = 100
      const seededRng = RngFactory.createSeeded(seed)
      const firstCall = seededRng(min, max)
      const secondCall = seededRng(min, max)
      const seededRngSameSeed = RngFactory.createSeeded(seed)
      const firstCallSameSeed = seededRngSameSeed(min, max)
      const secondCallSameSeed = seededRngSameSeed(min, max)
      expect(typeof seededRng).toBe('function')
      expect(firstCall).not.toEqual(secondCall)
      expect(firstCall).toEqual(firstCallSameSeed)
      expect(secondCall).toEqual(secondCallSameSeed)
      expect(firstCall).toBeGreaterThanOrEqual(min)
      expect(firstCall).toBeLessThan(max)
    })

    it('should produce numbers within the specified range', () => {
      const seed = 54321
      const min = 10
      const max = 20
      const seededRng = RngFactory.createSeeded(seed)
      for (let i = 0; i < 100; i++) {
        const result = seededRng(min, max)
        expect(result).toBeGreaterThanOrEqual(min)
        expect(result).toBeLessThan(max)
      }
    })
  })

  describe('default', () => {
    it('should use crypto.randomInt as the default RNG strategy', () => {
      ;(randomInt as jest.Mock).mockReturnValueOnce(42)
      const result = RngFactory.default(1, 100)
      expect(randomInt).toHaveBeenCalledWith(1, 100)
      expect(result).toBe(42)
    })
  })
})
