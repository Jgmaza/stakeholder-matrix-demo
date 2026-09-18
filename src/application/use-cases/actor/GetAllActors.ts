/**
 * Application Use Case: Get All Actors
 */

import { Actor } from "@/domain/entities/Actor";
import { ActorRepository, ActorsFilterParams, PaginatedActorsResult } from "@/domain/repositories/ActorRepository";

export class GetAllActors {
  constructor(private repository: ActorRepository) {}

  async execute(): Promise<Actor[]> {
    return await this.repository.findAll();
  }

  async executeWithFilters(filters: ActorsFilterParams): Promise<PaginatedActorsResult> {
    return await this.repository.findAllWithFilters(filters);
  }
}
