import { ApiProperty } from '@nestjs/swagger'
import { IsUUID } from 'class-validator'

export class CharacterIdRequestDto {
  @IsUUID(4, { message: 'ID must be a valid UUID' })
  @ApiProperty({
    description: 'Character unique identifier',
    example: '123e4567-e89b-12d3-a456-426614174000',
    format: 'uuid',
  })
  id: string
}
