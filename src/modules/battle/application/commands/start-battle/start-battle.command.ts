export class StartBattleCommand {
  constructor(
    public readonly character1Id: string,
    public readonly character2Id: string,
  ) {}
}
