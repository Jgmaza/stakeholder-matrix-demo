/**
 * Application Use Case: Update Cargo
 */

import { Cargo, UpdateCatalogDto } from "@/domain/entities/Catalog";
import { CargoRepository } from "@/domain/repositories/CatalogRepository";

export class UpdateCargo {
  constructor(private repository: CargoRepository) {}

  async execute(data: UpdateCatalogDto, userId: number): Promise<Cargo> {
    return await this.repository.update(data, userId);
  }
}

