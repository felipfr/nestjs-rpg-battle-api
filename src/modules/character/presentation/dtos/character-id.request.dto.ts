import { ApiProperty } from '@nestjs/swagger'
import { IsUUID } from 'class-validator'

export class CharacterIdRequestDto {
  @IsUUID(4, { message: 'ID must be a valid UUID' })
  @ApiProperty({
    description: 'Character unique identifier',
    format: 'uuid',
  })
  id: string
}
