import { SelfBattleError } from '../../../domain/errors/self-battle.error'
import { BattleService } from '../../../domain/services/battle.service'
import { StartBattleCommand } from './start-battle.command'
import { StartBattleHandler } from './start-battle.handler'

describe('StartBattleHandler', () => {
  let handler: StartBattleHandler
  let mockBattleService: jest.Mocked<BattleService>

  beforeEach(() => {
    mockBattleService = {
      executeBattle: jest.fn(),
    } as any
    handler = new StartBattleHandler(mockBattleService)
  })

  it('should execute battle and return result', () => {
    const command = new StartBattleCommand('char1-id', 'char2-id')
    const expectedBattleLog = 'Character 1 attacked Character 2 for 10 damage'
    mockBattleService.executeBattle.mockReturnValue(expectedBattleLog)
    const result = handler.handle(command)
    expect(result).toBe(expectedBattleLog)
    expect(mockBattleService.executeBattle).toHaveBeenCalledWith('char1-id', 'char2-id')
  })

  it('should propagate errors from battle service', () => {
    const command = new StartBattleCommand('char1-id', 'char1-id')
    mockBattleService.executeBattle.mockImplementation(() => {
      throw new SelfBattleError('char1-id')
    })
    expect(() => handler.handle(command)).toThrow(SelfBattleError)
  })
})
