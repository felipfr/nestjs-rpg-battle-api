import { IsIn, IsString, Length, Matches } from 'class-validator'
import { Job } from '~character/domain/enums/job.enum'

export class CreateCharacterRequestDto {
  @IsString({ message: 'Name must be a string' })
  @Length(4, 15, { message: 'Name must be between 4 and 15 characters' })
  @Matches(/^[A-Za-z_]+$/, {
    message: 'Name must contain only letters (A-Z, a-z) and underscore (_), no numbers or special characters',
  })
  name: string

  @IsString({ message: 'Job must be a string' })
  @IsIn(['Warrior', 'Thief', 'Mage'], { message: 'Job must be one of: Warrior, Thief, or Mage' })
  job: Job
}
