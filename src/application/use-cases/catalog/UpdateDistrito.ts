/**
 * Application Use Case: Update Distrito
 */

import { Distrito, UpdateCatalogDto } from "@/domain/entities/Catalog";
import { DistritoRepository } from "@/domain/repositories/CatalogRepository";

export class UpdateDistrito {
  constructor(private repository: DistritoRepository) {}

  async execute(data: UpdateCatalogDto, userId: number): Promise<Distrito> {
    return await this.repository.update(data, userId);
  }
}

