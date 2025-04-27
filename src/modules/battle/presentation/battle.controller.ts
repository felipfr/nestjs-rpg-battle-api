import { Body, Controller, HttpCode, Post } from '@nestjs/common'
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'

import { StartBattleCommand } from '../application/commands/start-battle/start-battle.command'
import { StartBattleHandler } from '../application/commands/start-battle/start-battle.handler'
import { BattleLogResponseDto } from './dtos/battle-log.response.dto'
import { StartBattleRequestDto } from './dtos/start-battle.request.dto'

@ApiTags('battle')
@Controller('battle')
export class BattleController {
  constructor(private readonly startBattleHandler: StartBattleHandler) {}

  @Post()
  @HttpCode(200)
  @ApiOperation({ summary: 'Start a battle between two characters' })
  @ApiBody({
    type: StartBattleRequestDto,
    examples: {
      requestTemplate: {
        summary: 'Request Template',
        description: 'Replace the placeholder UUIDs with actual character IDs.',
        value: {
          character1Id: 'replace-with-character-1-uuid',
          character2Id: 'replace-with-character-2-uuid',
        },
      },
      sameCharacter: {
        summary: 'Invalid request: character battling itself',
        value: {
          character1Id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
          character2Id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Battle concluded successfully, returning the battle log.',
    type: BattleLogResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid request data (e.g., invalid UUIDs, same character IDs, dead character).',
    content: {
      'application/json': {
        examples: {
          invalidUUID: {
            value: {
              statusCode: 400,
              message: ['Character 1 ID must be a valid UUID'],
              error: 'Bad Request',
            },
            summary: 'Invalid UUID format',
          },
          sameCharacter: {
            value: {
              statusCode: 400,
              message: 'A character cannot battle itself.',
              error: 'Bad Request',
            },
            summary: 'Character battling itself',
          },
          characterDead: {
            value: {
              statusCode: 400,
              message: 'Both characters must be alive to battle.',
              error: 'Bad Request',
            },
            summary: 'One or both characters are dead',
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'One or both characters not found.',
    content: {
      'application/json': {
        example: {
          statusCode: 404,
          message: "Character with id 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11' not found",
          error: 'Not Found',
        },
      },
    },
  })
  startBattle(@Body() dto: StartBattleRequestDto): BattleLogResponseDto {
    const command = new StartBattleCommand(dto.character1Id, dto.character2Id)
    const log = this.startBattleHandler.handle(command)
    return new BattleLogResponseDto(log)
  }
}
