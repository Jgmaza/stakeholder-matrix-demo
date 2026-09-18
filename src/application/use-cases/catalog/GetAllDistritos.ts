/**
 * Application Use Case: Get All Distritos
 */

import { Distrito } from "@/domain/entities/Catalog";
import { DistritoRepository } from "@/domain/repositories/CatalogRepository";

export class GetAllDistritos {
  constructor(private repository: DistritoRepository) {}

  async execute(): Promise<Distrito[]> {
    return await this.repository.findAll();
  }
}

