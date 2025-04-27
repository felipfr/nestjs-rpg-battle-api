import { ApiProperty } from '@nestjs/swagger'

import { ListCharacterDto } from '~character/application/dto/list-character.dto'
import { Job } from '~character/domain/enums/job.enum'
import type { PaginatedResult } from '~shared/application/dtos/cursor-pagination.dto'

class ListCharacterResponseDto {
  @ApiProperty({ description: 'Character unique identifier', example: 'uuid-example' })
  id: string

  @ApiProperty({ description: 'Character name', example: 'Hero_One' })
  name: string

  @ApiProperty({ enum: Job, description: 'Character job/class', example: 'Warrior' })
  job: Job

  @ApiProperty({ description: 'Whether the character is alive', example: true })
  isAlive: boolean

  constructor(id: string, name: string, job: Job, isAlive: boolean) {
    this.id = id
    this.name = name
    this.job = job
    this.isAlive = isAlive
  }

  static fromApplicationDto(dto: ListCharacterDto): ListCharacterResponseDto {
    return new ListCharacterResponseDto(dto.id, dto.name, dto.job, dto.isAlive)
  }
}

export class PaginatedCharacterResponseDto {
  @ApiProperty({ type: [ListCharacterResponseDto], description: 'List of characters' })
  data: ListCharacterResponseDto[]

  @ApiProperty({ description: 'Next page cursor', required: false, nullable: true })
  nextCursor?: string

  @ApiProperty({ description: 'Previous page cursor', required: false, nullable: true })
  previousCursor?: string

  @ApiProperty({ description: 'Whether there are more records available' })
  hasMore: boolean

  constructor(data: ListCharacterResponseDto[], hasMore: boolean, nextCursor?: string, previousCursor?: string) {
    this.data = data
    this.hasMore = hasMore
    this.nextCursor = nextCursor
    this.previousCursor = previousCursor
  }

  static fromApplicationDto(paginatedResult: PaginatedResult<ListCharacterDto>): PaginatedCharacterResponseDto {
    const transformedData = paginatedResult.data.map((dto) => ListCharacterResponseDto.fromApplicationDto(dto))

    return new PaginatedCharacterResponseDto(
      transformedData,
      paginatedResult.hasMore,
      paginatedResult.nextCursor,
      paginatedResult.previousCursor,
    )
  }
}
