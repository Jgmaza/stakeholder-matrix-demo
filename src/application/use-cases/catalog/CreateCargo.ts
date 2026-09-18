/**
 * Application Use Case: Create Cargo
 */

import { Cargo, CreateCatalogDto } from "@/domain/entities/Catalog";
import { CargoRepository } from "@/domain/repositories/CatalogRepository";

export class CreateCargo {
  constructor(private repository: CargoRepository) {}

  async execute(data: CreateCatalogDto, userId: number): Promise<Cargo> {
    return await this.repository.create(data, userId);
  }
}

