/**
 * Application Use Case: Get All Cargos
 */

import { Cargo } from "@/domain/entities/Catalog";
import { CargoRepository } from "@/domain/repositories/CatalogRepository";

export class GetAllCargos {
  constructor(private repository: CargoRepository) {}

  async execute(): Promise<Cargo[]> {
    return await this.repository.findAll();
  }
}

