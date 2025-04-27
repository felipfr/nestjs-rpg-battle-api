export class CharacterNotAliveError extends Error {
      constructor(characterId?: string) {
        const message = characterId
          ? `Character with ID ${characterId} is not alive and cannot battle.`
          : 'One or both characters must be alive to battle.';
        super(message);
        this.name = 'CharacterNotAliveError';
      }
    }
