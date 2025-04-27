export class BattleAlreadyConcludedError extends Error {
  constructor() {
    super('Battle has already concluded.')
    this.name = 'BattleAlreadyConcludedError'
  }
}