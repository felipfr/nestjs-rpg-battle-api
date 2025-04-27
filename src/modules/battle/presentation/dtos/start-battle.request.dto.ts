import { ApiProperty } from '@nestjs/swagger'
import { IsUUID } from 'class-validator'

export class StartBattleRequestDto {
  @ApiProperty({
    description: 'The UUID of the first character participating in the battle.',
    format: 'uuid',
  })
  @IsUUID('4', { message: 'Character 1 ID must be a valid UUID' })
  character1Id: string

  @ApiProperty({
    description: 'The UUID of the second character participating in the battle.',
    format: 'uuid',
  })
  @IsUUID('4', { message: 'Character 2 ID must be a valid UUID' })
  character2Id: string
}
