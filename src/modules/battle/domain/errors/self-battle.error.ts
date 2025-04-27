export class SelfBattleError extends Error {
  constructor(characterId: string) {
    super(`Character with ID ${characterId} cannot battle itself.`)
    this.name = 'SelfBattleError'
  }
}
