/**
 * Application Use Case: Delete Distrito
 */

import { DistritoRepository } from "@/domain/repositories/CatalogRepository";

export class DeleteDistrito {
  constructor(private repository: DistritoRepository) {}

  async execute(id: string): Promise<void> {
    await this.repository.delete(id);
  }
}
