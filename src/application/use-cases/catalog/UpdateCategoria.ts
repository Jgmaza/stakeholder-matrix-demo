/**
 * Application Use Case: Update Categoria
 */

import { Categoria, UpdateCatalogDto } from "@/domain/entities/Catalog";
import { CategoriaRepository } from "@/domain/repositories/CatalogRepository";

export class UpdateCategoria {
  constructor(private repository: CategoriaRepository) {}

  async execute(data: UpdateCatalogDto, userId: number): Promise<Categoria> {
    return await this.repository.update(data, userId);
  }
}

