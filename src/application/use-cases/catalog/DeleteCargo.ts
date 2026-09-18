/**
 * Application Use Case: Delete Cargo
 */

import { CargoRepository } from "@/domain/repositories/CatalogRepository";

export class DeleteCargo {
  constructor(private repository: CargoRepository) {}

  async execute(id: string): Promise<void> {
    await this.repository.delete(id);
  }
}

