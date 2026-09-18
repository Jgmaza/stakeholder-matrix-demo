/**
 * Application Use Case: Get All Categorias
 */

import { Categoria } from "@/domain/entities/Catalog";
import { CategoriaRepository } from "@/domain/repositories/CatalogRepository";

export class GetAllCategorias {
  constructor(private repository: CategoriaRepository) {}

  async execute(): Promise<Categoria[]> {
    return await this.repository.findAll();
  }
}

