import type { Job } from '~character/domain/enums/job.enum'

export class CreateCharacterCommand {
  constructor(
    public readonly name: string,
    public readonly job: Job,
  ) {}
}
