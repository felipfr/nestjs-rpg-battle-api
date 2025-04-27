import { ApiProperty } from '@nestjs/swagger';

export class BattleLogResponseDto {
  @ApiProperty({
    description: 'The detailed log of the battle, including rounds, turns, damage, and the final outcome.',
    example: `Battle between Hero (Warrior) - 100 HP and Villain (Mage) - 80 HP begins!
Hero 25 speed was faster than Villain 15 speed and will begin this round.
Hero attacks Villain for 10, Villain has 70 HP remaining.
Villain attacks Hero for 12, Hero has 88 HP remaining.
Villain 20 speed was faster than Hero 18 speed and will begin this round.
Villain attacks Hero for 11, Hero has 77 HP remaining.
Hero attacks Villain for 9, Villain has 61 HP remaining.
...
Hero wins the battle! Hero still has 45 HP remaining!`,
  })
  log: string;

  constructor(log: string) {
    this.log = log;
  }
}
