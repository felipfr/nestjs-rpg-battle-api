import { ApiProperty } from '@nestjs/swagger'
import { CharacterDto } from '~character/application/dto/character.dto'

export class CharacterResponseDto {
  @ApiProperty({
    description: 'Unique identifier for the character',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string

  @ApiProperty({
    description: 'Character name',
    example: 'Hero_One',
    minLength: 4,
    maxLength: 15,
  })
  name: string

  @ApiProperty({
    description: 'Character job/class',
    example: 'Warrior',
    enum: ['Warrior', 'Thief', 'Mage'],
  })
  job: string

  @ApiProperty({
    description: 'Indicates whether the character is alive',
    example: true,
  })
  isAlive: boolean

  @ApiProperty({
    description: 'Current health points',
    example: 120,
    minimum: 0,
  })
  healthPoints: number

  @ApiProperty({
    description: 'Maximum possible health points',
    example: 120,
    minimum: 0,
  })
  maxHealthPoints: number

  @ApiProperty({
    description: 'Attack modifier calculated for battle',
    example: 18,
    minimum: 0,
  })
  attackModifier: number

  @ApiProperty({
    description: 'Speed modifier calculated for battle',
    example: 12,
    minimum: 0,
  })
  speedModifier: number

  @ApiProperty({
    description: 'Character stats',
    example: {
      strength: 10,
      dexterity: 5,
      intelligence: 5,
    },
  })
  stats: { strength: number; dexterity: number; intelligence: number }

  static fromApplicationDto(dto: CharacterDto): CharacterResponseDto {
    const responseDto = new CharacterResponseDto()
    Object.assign(responseDto, dto)
    return responseDto
  }
}
