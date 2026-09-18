/**
 * Application Use Case: Update Organizacion
 */

import { Organization, UpdateCatalogDto } from "@/domain/entities/Catalog";
import { OrganizationRepository } from "@/domain/repositories/CatalogRepository";

export class UpdateOrganizacion {
  constructor(private repository: OrganizationRepository) {}

  async execute(data: UpdateCatalogDto, userId: number): Promise<Organization> {
    return await this.repository.update(data, userId);
  }
}

