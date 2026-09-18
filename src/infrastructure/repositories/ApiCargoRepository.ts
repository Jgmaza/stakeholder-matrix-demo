/**
 * Infrastructure: API Cargo Repository
 * Real API implementation for cargo data operations
 */

import { Cargo, CreateCatalogDto, UpdateCatalogDto } from "@/domain/entities/Catalog";
import { CargoRepository } from "@/domain/repositories/CatalogRepository";
import { apiRequest } from "../services/apiService";
import {
  mapApiCargoToDomain,
  mapDomainCargoCreateToApi,
  mapDomainCargoUpdateToApi,
  ApiCargoOut,
} from "../mappers/catalogMapper";

export class ApiCargoRepository implements CargoRepository {
  async findAll(): Promise<Cargo[]> {
    const apiCargos = await apiRequest<ApiCargoOut[]>("/api/v1/cargos/");
    return apiCargos.map(mapApiCargoToDomain);
  }

  async findById(id: string): Promise<Cargo | null> {
    try {
      const apiCargo = await apiRequest<ApiCargoOut>(`/api/v1/cargos/${id}`);
      return mapApiCargoToDomain(apiCargo);
    } catch (error) {
      if (error instanceof Error && (error as any).status === 404) {
        return null;
      }
      throw error;
    }
  }

  async create(data: CreateCatalogDto, userId: number): Promise<Cargo> {
    const apiData = mapDomainCargoCreateToApi(data, userId);
    const apiCargo = await apiRequest<ApiCargoOut>("/api/v1/cargos/", {
      method: "POST",
      body: JSON.stringify(apiData),
    });
    return mapApiCargoToDomain(apiCargo);
  }

  async update(data: UpdateCatalogDto, userId: number): Promise<Cargo> {
    const apiData = mapDomainCargoUpdateToApi(data, userId);
    const apiCargo = await apiRequest<ApiCargoOut>(`/api/v1/cargos/${data.id}`, {
      method: "PUT",
      body: JSON.stringify(apiData),
    });
    return mapApiCargoToDomain(apiCargo);
  }

  async delete(id: string): Promise<void> {
    await apiRequest<void>(`/api/v1/cargos/${id}`, {
      method: "DELETE",
    });
  }
}

export const apiCargoRepository = new ApiCargoRepository();

