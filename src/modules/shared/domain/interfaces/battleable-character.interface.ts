export interface BattleableCharacter {
  id: string;
  name: string;
  job: string;
  healthPoints: number;
  maxHealthPoints: number;
  isAlive: boolean;
  calculateAttackModifier(): number;
  calculateSpeedModifier(): number;
  receiveDamage(damage: number): void;
}
