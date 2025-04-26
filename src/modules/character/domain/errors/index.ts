export class DuplicateCharacterNameError extends Error {
  constructor(name: string) {
    super(`Character name '${name}' is already in use`)
    this.name = 'DuplicateCharacterNameError'
  }
}

export class CharacterNotFoundError extends Error {
  constructor(id: string) {
    super(`Character with id '${id}' not found`)
    this.name = 'CharacterNotFoundError'
  }
}

export class InvalidCursorError extends Error {
  constructor(cursor: string) {
    super(`Invalid pagination cursor: '${cursor}'`)
    this.name = 'InvalidCursorError'
  }
}
