/**
 * Application Use Case: Create Organizacion
 */

import { Organization, CreateCatalogDto } from "@/domain/entities/Catalog";
import { OrganizationRepository } from "@/domain/repositories/CatalogRepository";

export class CreateOrganizacion {
  constructor(private repository: OrganizationRepository) {}

  async execute(data: CreateCatalogDto, userId: number): Promise<Organization> {
    return await this.repository.create(data, userId);
  }
}

