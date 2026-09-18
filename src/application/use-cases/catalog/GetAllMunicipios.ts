/**
 * Application Use Case: Get All Municipios
 */

import { Municipio } from "@/domain/entities/Catalog";
import { MunicipioRepository } from "@/domain/repositories/CatalogRepository";

export class GetAllMunicipios {
  constructor(private repository: MunicipioRepository) {}

  async execute(): Promise<Municipio[]> {
    return await this.repository.findAll();
  }
}

