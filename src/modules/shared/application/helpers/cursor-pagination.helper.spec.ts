import { CursorPaginationOptions, PaginationDirection } from '~shared/application/dtos/cursor-pagination.dto'
import { CursorPaginationHelper } from './cursor-pagination.helper'

interface TestItem {
  id: string
  name: string
}

describe('CursorPaginationHelper', () => {
  let items: TestItem[]

  beforeEach(() => {
    items = [
      { id: '1', name: 'Item 1' },
      { id: '2', name: 'Item 2' },
      { id: '3', name: 'Item 3' },
      { id: '4', name: 'Item 4' },
      { id: '5', name: 'Item 5' },
    ]
  })

  describe('paginate', () => {
    it('should return all items when no options are provided', () => {
      const result = CursorPaginationHelper.paginate(items)
      expect(result.data).toEqual(items)
      expect(result.hasMore).toBe(false)
      expect(result.nextCursor).toBeUndefined()
      expect(result.previousCursor).toBeUndefined()
    })

    it('should return limited number of items when limit is provided', () => {
      const options: CursorPaginationOptions = { limit: 2, direction: PaginationDirection.NEXT }
      const result = CursorPaginationHelper.paginate(items, options)
      expect(result.data).toEqual([items[0], items[1]])
      expect(result.hasMore).toBe(true)
      expect(result.nextCursor).toBe('3')
      expect(result.previousCursor).toBeUndefined()
    })

    it('should return items after cursor when direction is "next"', () => {
      const options: CursorPaginationOptions = { cursor: '2', limit: 2, direction: PaginationDirection.NEXT }
      const result = CursorPaginationHelper.paginate(items, options)
      expect(result.data).toEqual([items[1], items[2]])
      expect(result.hasMore).toBe(true)
      expect(result.nextCursor).toBe('4')
      expect(result.previousCursor).toBe('1')
    })

    it('should return items before cursor when direction is "previous"', () => {
      const options: CursorPaginationOptions = { cursor: '4', limit: 2, direction: PaginationDirection.PREVIOUS }
      const result = CursorPaginationHelper.paginate(items, options)
      expect(result.data).toEqual([items[2], items[3]])
      expect(result.hasMore).toBe(true)
      expect(result.nextCursor).toBe('5')
      expect(result.previousCursor).toBe('2')
    })

    it('should correctly handle when cursor is the first item with previous direction', () => {
      const options: CursorPaginationOptions = { cursor: '1', limit: 2, direction: PaginationDirection.PREVIOUS }
      const result = CursorPaginationHelper.paginate(items, options)
      expect(result.data).toEqual([items[0], items[1]])
      expect(result.hasMore).toBe(true)
      expect(result.nextCursor).toBe('3')
      expect(result.previousCursor).toBeUndefined()
    })

    it('should correctly handle when cursor is the last item with next direction', () => {
      const options: CursorPaginationOptions = { cursor: '5', limit: 2, direction: PaginationDirection.NEXT }
      const result = CursorPaginationHelper.paginate(items, options)
      expect(result.data).toEqual([items[4]])
      expect(result.hasMore).toBe(false)
      expect(result.nextCursor).toBeUndefined()
      expect(result.previousCursor).toBe('4')
    })

    it('should return empty array for empty collection', () => {
      const emptyItems: TestItem[] = []
      const options: CursorPaginationOptions = { limit: 10, direction: PaginationDirection.NEXT }
      const result = CursorPaginationHelper.paginate(emptyItems, options)
      expect(result.data).toEqual([])
      expect(result.hasMore).toBe(false)
      expect(result.nextCursor).toBeUndefined()
      expect(result.previousCursor).toBeUndefined()
    })

    it('should handle invalid cursor by returning empty array', () => {
      const options: CursorPaginationOptions = {
        cursor: 'invalid-cursor',
        limit: 2,
        direction: PaginationDirection.NEXT,
      }
      const result = CursorPaginationHelper.paginate(items, options)
      expect(result.data).toEqual([])
      expect(result.hasMore).toBe(false)
      expect(result.nextCursor).toBeUndefined()
      expect(result.previousCursor).toBeUndefined()
    })

    it('should handle previous direction without cursor by returning last page', () => {
      const options: CursorPaginationOptions = { limit: 3, direction: PaginationDirection.PREVIOUS }
      const result = CursorPaginationHelper.paginate(items, options)
      expect(result.data).toEqual([items[2], items[3], items[4]])
      expect(result.hasMore).toBe(false)
      expect(result.nextCursor).toBeUndefined()
      expect(result.previousCursor).toBe('2')
    })
  })
})
