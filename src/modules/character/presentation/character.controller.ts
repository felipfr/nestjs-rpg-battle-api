import {
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  Get,
  HttpCode,
  NotFoundException,
  Param,
  Post,
  Query,
  ValidationPipe,
} from '@nestjs/common'
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'

import { CreateCharacterCommand } from '~character/application/commands/create-character/create-character.command'
import { CreateCharacterCommandHandler } from '~character/application/commands/create-character/create-character.handler'
import { ListCharacterDto } from '~character/application/dto/list-character.dto'
import { GetCharacterByIdQueryHandler } from '~character/application/queries/get-character-by-id/get-character-by-id.handler'
import { GetCharacterByIdQuery } from '~character/application/queries/get-character-by-id/get-character-by-id.query'
import { ListCharactersQueryHandler } from '~character/application/queries/list-characters/list-characters.handler'
import { ListCharactersQuery } from '~character/application/queries/list-characters/list-characters.query'
import type { PaginatedResult } from '~shared/application/dtos/cursor-pagination.dto'
import { CharacterNotFoundError, DuplicateCharacterNameError, InvalidCursorError } from '../domain/errors'
import { CharacterIdRequestDto } from './dtos/character-id.request.dto'
import { CharacterResponseDto } from './dtos/character.response.dto'
import { CreateCharacterRequestDto } from './dtos/create-character.request.dto'
import { ListCharactersRequestDto } from './dtos/list-characters.request.dto'

@ApiTags('characters')
@Controller('characters')
export class CharacterController {
  constructor(
    private readonly createCharacterHandler: CreateCharacterCommandHandler,
    private readonly getCharacterByIdHandler: GetCharacterByIdQueryHandler,
    private readonly listCharactersHandler: ListCharactersQueryHandler,
  ) {}

  @Get()
  @ApiOperation({ summary: 'List all characters with pagination' })
  @ApiOperation({ summary: 'List all characters with pagination' })
  @ApiResponse({
    status: 200,
    description: 'Paginated list of characters',
    content: {
      'application/json': {
        examples: {
          nextPage: {
            summary: 'Next page pagination (next)',
            value: {
              data: [
                { id: 'uuid-1', name: 'Hero_One', job: 'Warrior', isAlive: true },
                { id: 'uuid-2', name: 'Sneaky_Thief', job: 'Thief', isAlive: false },
              ],
              nextCursor: 'uuid-3',
              hasMore: true,
            },
          },
          previousPage: {
            summary: 'Previous page pagination (previous)',
            value: {
              data: [
                { id: 'uuid-3', name: 'Magic_User', job: 'Mage', isAlive: true },
                { id: 'uuid-4', name: 'Sword_Master', job: 'Warrior', isAlive: true },
              ],
              nextCursor: 'uuid-5',
              previousCursor: 'uuid-2',
              hasMore: true,
            },
          },
          lastPage: {
            summary: 'Last page pagination (no more pages)',
            value: {
              data: [
                { id: 'uuid-5', name: 'Magic_Girl', job: 'Mage', isAlive: true },
                { id: 'uuid-6', name: 'Hero_Two', job: 'Warrior', isAlive: true },
              ],
              previousCursor: 'uuid-4',
              hasMore: false,
            },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid pagination parameters',
    content: {
      'application/json': {
        examples: {
          invalidLimit: {
            value: {
              statusCode: 400,
              message: ['limit must not be less than 1', 'limit must be an integer number'],
              error: 'Bad Request',
            },
            summary: 'Invalid limit parameter',
          },
          invalidDirection: {
            value: { statusCode: 400, message: ['direction must be a valid enum value'], error: 'Bad Request' },
            summary: 'Invalid direction parameter',
          },
          invalidCursor: {
            value: { statusCode: 400, message: "Invalid pagination cursor: 'invalid-id'", error: 'Bad Request' },
            summary: 'Invalid cursor parameter',
          },
        },
      },
    },
  })
  listCharacters(
    @Query(new ValidationPipe({ transform: true, whitelist: true })) query: ListCharactersRequestDto,
  ): PaginatedResult<ListCharacterDto> {
    try {
      const listQuery = new ListCharactersQuery(query)
      return this.listCharactersHandler.execute(listQuery)
    } catch (error) {
      if (error instanceof InvalidCursorError) throw new BadRequestException(error.message)
      throw error
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get character details by id' })
  @ApiResponse({
    status: 200,
    description: 'Character details',
    type: CharacterResponseDto,
    content: {
      'application/json': {
        examples: {
          warrior: {
            value: {
              id: 'uuid-example',
              name: 'Hero_One',
              job: 'Warrior',
              healthPoints: 20,
              maxHealthPoints: 20,
              stats: { strength: 10, dexterity: 5, intelligence: 5 },
              isAlive: true,
              attackModifier: 18,
              speedModifier: 12,
            },
            summary: 'Warrior character details',
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Character not found',
    content: {
      'application/json': {
        example: {
          statusCode: 404,
          message: "Character with id 'uuid-example' not found",
          error: 'Not Found',
        },
      },
    },
  })
  getCharacterById(@Param(new ValidationPipe()) params: CharacterIdRequestDto): CharacterResponseDto {
    try {
      const query = new GetCharacterByIdQuery(params.id)
      const characterDto = this.getCharacterByIdHandler.execute(query)
      return CharacterResponseDto.fromApplicationDto(characterDto)
    } catch (error) {
      if (error instanceof CharacterNotFoundError) throw new NotFoundException(error.message)
      throw error
    }
  }

  @Post()
  @HttpCode(201)
  @ApiOperation({ summary: 'Create a new character' })
  @ApiBody({
    type: CreateCharacterRequestDto,
    examples: {
      warrior: { summary: 'Valid Warrior character', value: { name: 'Hero_One', job: 'Warrior' } },
      thief: { summary: 'Valid Thief character', value: { name: 'Sneaky_Thief', job: 'Thief' } },
      mage: { summary: 'Valid Mage character', value: { name: 'Magic_User', job: 'Mage' } },
      invalidName: { summary: 'Invalid character name (contains numbers)', value: { name: 'Hero123', job: 'Warrior' } },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Character created successfully',
    type: CharacterResponseDto,
    content: {
      'application/json': {
        examples: {
          warrior: {
            value: {
              id: 'uuid-example',
              name: 'Hero_One',
              job: 'Warrior',
              healthPoints: 20,
              maxHealthPoints: 20,
              stats: { strength: 10, dexterity: 5, intelligence: 5 },
              isAlive: true,
            },
            summary: 'Warrior character stats',
          },
          thief: {
            value: {
              id: 'uuid-example',
              name: 'Sneaky_Thief',
              job: 'Thief',
              healthPoints: 15,
              maxHealthPoints: 15,
              stats: { strength: 4, dexterity: 10, intelligence: 4 },
              isAlive: true,
            },
            summary: 'Thief character stats',
          },
          mage: {
            value: {
              id: 'uuid-example',
              name: 'Magic_User',
              job: 'Mage',
              healthPoints: 12,
              maxHealthPoints: 12,
              stats: { strength: 5, dexterity: 6, intelligence: 10 },
              isAlive: true,
            },
            summary: 'Mage character stats',
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid character data',
    content: {
      'application/json': {
        examples: {
          invalidName: {
            value: {
              message: [
                'Name must contain only letters (A-Z, a-z) and underscore (_), no numbers or special characters',
              ],
              error: 'Bad Request',
              statusCode: 400,
            },
            summary: 'Invalid name format',
          },
          invalidJob: {
            value: { message: ['Job must be one of: Warrior, Thief, or Mage'], error: 'Bad Request', statusCode: 400 },
            summary: 'Invalid job',
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 409,
    description: 'Character name already in use',
    content: {
      'application/json': {
        examples: {
          duplicateName: {
            value: { message: "Character name 'Hero_One' is already in use", error: 'Conflict', statusCode: 409 },
            summary: 'Duplicate character name',
          },
        },
      },
    },
  })
  createCharacter(@Body() dto: CreateCharacterRequestDto): CharacterResponseDto {
    try {
      const command = new CreateCharacterCommand(dto.name, dto.job)
      const characterDto = this.createCharacterHandler.execute(command)
      return CharacterResponseDto.fromApplicationDto(characterDto)
    } catch (error) {
      if (error instanceof DuplicateCharacterNameError) throw new ConflictException(error.message)
      throw error
    }
  }
}
