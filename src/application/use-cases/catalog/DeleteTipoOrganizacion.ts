/**
 * Application Use Case: Delete Tipo Organizacion
 */

import { TipoOrganizacionRepository } from "@/domain/repositories/CatalogRepository";

export class DeleteTipoOrganizacion {
  constructor(private repository: TipoOrganizacionRepository) {}

  async execute(id: string): Promise<void> {
    await this.repository.delete(id);
  }
}

