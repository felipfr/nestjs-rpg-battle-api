import { PaginatedResult } from '../../application/dtos/cursor-pagination.dto'
import type { Battle } from '../models/battle'

export interface BattleRepositoryInterface {
  save(battle: Battle): Battle
  findById(id: string): Battle | null
  findAll(): PaginatedResult<Battle>
}
