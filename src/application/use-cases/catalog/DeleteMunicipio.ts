/**
 * Application Use Case: Delete Municipio
 */

import { MunicipioRepository } from "@/domain/repositories/CatalogRepository";

export class DeleteMunicipio {
  constructor(private repository: MunicipioRepository) {}

  async execute(id: string): Promise<void> {
    await this.repository.delete(id);
  }
}
