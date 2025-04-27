import { ApiPropertyOptional } from '@nestjs/swagger'
import { Transform } from 'class-transformer'
import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator'

import { PaginationDirection } from '~shared/application/dtos/cursor-pagination.dto'

export class ListCharactersRequestDto {
  @ApiPropertyOptional({ description: 'Cursor for pagination', type: String })
  @IsOptional()
  @IsString()
  cursor?: string

  @ApiPropertyOptional({
    description: 'Number of items per page',
    type: Number,
    example: 10,
    default: 10,
    minimum: 1,
    maximum: 100,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  @Transform(({ value }) => parseInt(value, 10))
  limit: number = 10

  @ApiPropertyOptional({
    description: 'Pagination direction',
    enum: [PaginationDirection.NEXT, PaginationDirection.PREVIOUS],
    default: PaginationDirection.NEXT,
  })
  @IsOptional()
  @IsEnum(PaginationDirection)
  direction: PaginationDirection.NEXT | PaginationDirection.PREVIOUS = PaginationDirection.NEXT
}

