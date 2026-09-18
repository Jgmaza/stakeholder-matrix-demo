/**
 * Application Use Case: Create Categoria
 */

import { Categoria, CreateCatalogDto } from "@/domain/entities/Catalog";
import { CategoriaRepository } from "@/domain/repositories/CatalogRepository";

export class CreateCategoria {
  constructor(private repository: CategoriaRepository) {}

  async execute(data: CreateCatalogDto, userId: number): Promise<Categoria> {
    return await this.repository.create(data, userId);
  }
}

