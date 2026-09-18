/**
 * Application Use Case: Delete Categoria
 */

import { CategoriaRepository } from "@/domain/repositories/CatalogRepository";

export class DeleteCategoria {
  constructor(private repository: CategoriaRepository) {}

  async execute(id: string): Promise<void> {
    await this.repository.delete(id);
  }
}

