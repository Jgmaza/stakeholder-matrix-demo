/**
 * Application Use Case: Get All Tipos Organizaciones
 */

import { TipoOrganizacion } from "@/domain/entities/Catalog";
import { TipoOrganizacionRepository } from "@/domain/repositories/CatalogRepository";

export class GetAllTiposOrganizaciones {
  constructor(private repository: TipoOrganizacionRepository) {}

  async execute(): Promise<TipoOrganizacion[]> {
    return await this.repository.findAll();
  }
}

