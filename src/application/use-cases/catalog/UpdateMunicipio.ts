/**
 * Application Use Case: Update Municipio
 */

import { Municipio, UpdateCatalogDto } from "@/domain/entities/Catalog";
import { MunicipioRepository } from "@/domain/repositories/CatalogRepository";

export class UpdateMunicipio {
  constructor(private repository: MunicipioRepository) {}

  async execute(data: UpdateCatalogDto, userId: number): Promise<Municipio> {
    return await this.repository.update(data, userId);
  }
}

