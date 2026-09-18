/**
 * Application Use Case: Create Distrito
 */

import { Distrito, CreateCatalogDto } from "@/domain/entities/Catalog";
import { DistritoRepository } from "@/domain/repositories/CatalogRepository";

export class CreateDistrito {
  constructor(private repository: DistritoRepository) {}

  async execute(data: CreateCatalogDto, userId: number): Promise<Distrito> {
    return await this.repository.create(data, userId);
  }
}

