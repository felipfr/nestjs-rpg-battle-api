import { Job } from '~character/domain/enums/job.enum'

export class ListCharacterDto {
  id: string
  name: string
  job: Job
  isAlive: boolean

  constructor(id: string, name: string, job: Job, isAlive: boolean) {
    this.id = id
    this.name = name
    this.job = job
    this.isAlive = isAlive
  }
}
