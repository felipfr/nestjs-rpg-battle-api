import {
  type CursorPaginationOptions,
  PaginatedResult,
  PaginationDirection,
} from '~shared/application/dtos/cursor-pagination.dto'

interface WithId {
  id: string
}

export class CursorPaginationHelper {
  /**
   * Applies cursor-based pagination to a collection of items that have an 'id' property
   * @param items Full collection of items to paginate (must have 'id' property)
   * @param options Cursor pagination options
   */
  static paginate<T extends WithId>(items: T[], options?: CursorPaginationOptions): PaginatedResult<T> {
    if (!options) return new PaginatedResult(items, false)
    const { cursor, limit, direction = PaginationDirection.NEXT } = options
    const cursorIndex = cursor ? items.findIndex((item) => item.id === cursor) : -1
    if (cursor && cursorIndex === -1) return new PaginatedResult([], false)

    let start: number

    if (direction === PaginationDirection.NEXT) {
      start = cursor ? cursorIndex : 0
    } else {
      start = cursor ? Math.max(0, cursorIndex - limit + 1) : Math.max(0, items.length - limit)
    }

    const data = items.slice(start, start + limit)
    const hasNext = start + data.length < items.length
    const hasPrevious = start > 0
    const nextCursor = hasNext ? items[start + data.length].id : undefined
    const previousCursor = hasPrevious ? items[start - 1].id : undefined
    return new PaginatedResult(data, hasNext, nextCursor, previousCursor)
  }
}
