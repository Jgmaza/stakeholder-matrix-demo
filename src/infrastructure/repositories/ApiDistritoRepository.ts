/**
 * Infrastructure: API Distrito Repository
 * Real API implementation for distrito data operations
 */

import { Distrito, CreateCatalogDto, UpdateCatalogDto } from "@/domain/entities/Catalog";
import { DistritoRepository } from "@/domain/repositories/CatalogRepository";
import { apiRequest } from "../services/apiService";
import {
  mapApiDistritoToDomain,
  mapDomainDistritoCreateToApi,
  mapDomainDistritoUpdateToApi,
  ApiDistritoOut,
} from "../mappers/catalogMapper";

export class ApiDistritoRepository implements DistritoRepository {
  /**
   * Get all distritos
   */
  async findAll(): Promise<Distrito[]> {
    const apiDistritos = await apiRequest<ApiDistritoOut[]>("/api/v1/distritos/");
    return apiDistritos.map(mapApiDistritoToDomain);
  }

  /**
   * Get distrito by ID
   */
  async findById(id: string): Promise<Distrito | null> {
    try {
      const apiDistrito = await apiRequest<ApiDistritoOut>(`/api/v1/distritos/${id}`);
      return mapApiDistritoToDomain(apiDistrito);
    } catch (error) {
      if (error instanceof Error && (error as any).status === 404) {
        return null;
      }
      throw error;
    }
  }

  /**
   * Create distrito
   * @param data - Distrito data
   * @param userId - ID of the user creating the distrito
   */
  async create(data: CreateCatalogDto, userId: number): Promise<Distrito> {
    const apiData = mapDomainDistritoCreateToApi(data, userId);
    const apiDistrito = await apiRequest<ApiDistritoOut>("/api/v1/distritos/", {
      method: "POST",
      body: JSON.stringify(apiData),
    });
    return mapApiDistritoToDomain(apiDistrito);
  }

  /**
   * Update distrito
   * @param data - Distrito data with ID
   * @param userId - ID of the user updating the distrito
   */
  async update(data: UpdateCatalogDto, userId: number): Promise<Distrito> {
    const apiData = mapDomainDistritoUpdateToApi(data, userId);
    const apiDistrito = await apiRequest<ApiDistritoOut>(`/api/v1/distritos/${data.id}`, {
      method: "PUT",
      body: JSON.stringify(apiData),
    });
    return mapApiDistritoToDomain(apiDistrito);
  }

  /**
   * Delete distrito
   */
  async delete(id: string): Promise<void> {
    await apiRequest<void>(`/api/v1/distritos/${id}`, {
      method: "DELETE",
    });
  }
}

export const apiDistritoRepository = new ApiDistritoRepository();

