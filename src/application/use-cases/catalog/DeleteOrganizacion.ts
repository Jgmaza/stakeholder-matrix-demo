/**
 * Application Use Case: Delete Organizacion
 */

import { OrganizationRepository } from "@/domain/repositories/CatalogRepository";

export class DeleteOrganizacion {
  constructor(private repository: OrganizationRepository) {}

  async execute(id: string): Promise<void> {
    await this.repository.delete(id);
  }
}
