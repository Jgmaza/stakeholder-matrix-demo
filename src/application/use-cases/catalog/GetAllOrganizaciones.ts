/**
 * Application Use Case: Get All Organizaciones
 */

import { Organization } from "@/domain/entities/Catalog";
import { OrganizationRepository } from "@/domain/repositories/CatalogRepository";

export class GetAllOrganizaciones {
  constructor(private repository: OrganizationRepository) {}

  async execute(): Promise<Organization[]> {
    return await this.repository.findAll();
  }
}

