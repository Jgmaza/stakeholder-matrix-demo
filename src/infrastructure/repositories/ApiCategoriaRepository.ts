/**
 * Infrastructure: API Categoria Repository
 * Real API implementation for categoria data operations
 */

import { Categoria, CreateCatalogDto, UpdateCatalogDto } from "@/domain/entities/Catalog";
import { CategoriaRepository } from "@/domain/repositories/CatalogRepository";
import { apiRequest } from "../services/apiService";
import {
  mapApiCategoriaToDomain,
  mapDomainCategoriaCreateToApi,
  mapDomainCategoriaUpdateToApi,
  ApiCategoriaOut,
} from "../mappers/catalogMapper";

export class ApiCategoriaRepository implements CategoriaRepository {
  /**
   * Get all categorias
   */
  async findAll(): Promise<Categoria[]> {
    const apiCategorias = await apiRequest<ApiCategoriaOut[]>("/api/v1/categorias/");
    return apiCategorias.map(mapApiCategoriaToDomain);
  }

  /**
   * Get categoria by ID
   */
  async findById(id: string): Promise<Categoria | null> {
    try {
      const apiCategoria = await apiRequest<ApiCategoriaOut>(`/api/v1/categorias/${id}`);
      return mapApiCategoriaToDomain(apiCategoria);
    } catch (error) {
      if (error instanceof Error && (error as any).status === 404) {
        return null;
      }
      throw error;
    }
  }

  /**
   * Create categoria
   * @param data - Categoria data
   * @param userId - ID of the user creating the categoria
   */
  async create(data: CreateCatalogDto, userId: number): Promise<Categoria> {
    const apiData = mapDomainCategoriaCreateToApi(data, userId);
    const apiCategoria = await apiRequest<ApiCategoriaOut>("/api/v1/categorias/", {
      method: "POST",
      body: JSON.stringify(apiData),
    });
    return mapApiCategoriaToDomain(apiCategoria);
  }

  /**
   * Update categoria
   * @param data - Categoria data with ID
   * @param userId - ID of the user updating the categoria
   */
  async update(data: UpdateCatalogDto, userId: number): Promise<Categoria> {
    const apiData = mapDomainCategoriaUpdateToApi(data, userId);
    const apiCategoria = await apiRequest<ApiCategoriaOut>(`/api/v1/categorias/${data.id}`, {
      method: "PUT",
      body: JSON.stringify(apiData),
    });
    return mapApiCategoriaToDomain(apiCategoria);
  }

  /**
   * Delete categoria
   */
  async delete(id: string): Promise<void> {
    await apiRequest<void>(`/api/v1/categorias/${id}`, {
      method: "DELETE",
    });
  }
}

export const apiCategoriaRepository = new ApiCategoriaRepository();

