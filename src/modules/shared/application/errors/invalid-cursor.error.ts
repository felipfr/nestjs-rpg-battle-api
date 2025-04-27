export class InvalidCursorError extends Error {
  constructor(cursor: string) {
    super(`Invalid pagination cursor: '${cursor}'`)
    this.name = 'InvalidCursorError'
  }
}
