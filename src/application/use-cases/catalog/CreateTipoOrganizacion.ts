/**
 * Application Use Case: Create Tipo Organizacion
 */

import { TipoOrganizacion, CreateCatalogDto } from "@/domain/entities/Catalog";
import { TipoOrganizacionRepository } from "@/domain/repositories/CatalogRepository";

export class CreateTipoOrganizacion {
  constructor(private repository: TipoOrganizacionRepository) {}

  async execute(data: CreateCatalogDto, userId: number): Promise<TipoOrganizacion> {
    return await this.repository.create(data, userId);
  }
}

