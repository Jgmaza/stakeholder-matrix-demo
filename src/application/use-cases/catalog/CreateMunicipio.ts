/**
 * Application Use Case: Create Municipio
 */

import { Municipio, CreateCatalogDto } from "@/domain/entities/Catalog";
import { MunicipioRepository } from "@/domain/repositories/CatalogRepository";

export class CreateMunicipio {
  constructor(private repository: MunicipioRepository) {}

  async execute(data: CreateCatalogDto, userId: number): Promise<Municipio> {
    return await this.repository.create(data, userId);
  }
}

