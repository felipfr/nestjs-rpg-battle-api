export enum PaginationDirection {
  NEXT = 'next',
  PREVIOUS = 'previous',
}

export interface CursorPaginationOptions {
  cursor?: string
  limit: number
  direction: PaginationDirection
}

export class PaginatedResult<T> {
  data: T[]
  nextCursor?: string
  previousCursor?: string
  hasMore: boolean

  constructor(data: T[], hasMore: boolean, nextCursor?: string, previousCursor?: string) {
    this.data = data
    this.hasMore = hasMore
    this.nextCursor = nextCursor
    this.previousCursor = previousCursor
  }
}
