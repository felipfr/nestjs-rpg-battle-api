import type { CursorPaginationOptions, PaginationDirection } from '~shared/application/dtos/cursor-pagination.dto'

export class ListCharactersQuery {
  readonly cursor?: string
  readonly limit: number
  readonly direction: PaginationDirection

  constructor(options: CursorPaginationOptions) {
    this.cursor = options.cursor
    this.limit = options.limit
    this.direction = options.direction
  }
}
