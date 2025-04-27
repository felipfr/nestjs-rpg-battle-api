export class DuplicateCharacterNameError extends Error {
  constructor(name: string) {
    super(`Character name '${name}' is already in use`)
    this.name = 'DuplicateCharacterNameError'
  }
}
