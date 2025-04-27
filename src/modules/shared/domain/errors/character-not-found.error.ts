export class CharacterNotFoundError extends Error {
  constructor(id: string) {
    super(`Character with id '${id}' not found`)
    this.name = 'CharacterNotFoundError'
  }
}
