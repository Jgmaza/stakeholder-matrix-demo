/**
 * Application Use Case: Update Tipo Organizacion
 */

import { TipoOrganizacion, UpdateCatalogDto } from "@/domain/entities/Catalog";
import { TipoOrganizacionRepository } from "@/domain/repositories/CatalogRepository";

export class UpdateTipoOrganizacion {
  constructor(private repository: TipoOrganizacionRepository) {}

  async execute(data: UpdateCatalogDto, userId: number): Promise<TipoOrganizacion> {
    return await this.repository.update(data, userId);
  }
}

