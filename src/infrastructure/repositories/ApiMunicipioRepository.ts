/**
 * Infrastructure: API Municipio Repository
 * Real API implementation for municipio data operations
 */

import { Municipio, CreateCatalogDto, UpdateCatalogDto } from "@/domain/entities/Catalog";
import { MunicipioRepository } from "@/domain/repositories/CatalogRepository";
import { apiRequest } from "../services/apiService";
import {
  mapApiMunicipioToDomain,
  mapDomainMunicipioCreateToApi,
  mapDomainMunicipioUpdateToApi,
  ApiMunicipioOut,
} from "../mappers/catalogMapper";

export class ApiMunicipioRepository implements MunicipioRepository {
  /**
   * Get all municipios
   */
  async findAll(): Promise<Municipio[]> {
    const apiMunicipios = await apiRequest<ApiMunicipioOut[]>("/api/v1/municipios/");
    return apiMunicipios.map(mapApiMunicipioToDomain);
  }

  /**
   * Get municipio by ID
   */
  async findById(id: string): Promise<Municipio | null> {
    try {
      const apiMunicipio = await apiRequest<ApiMunicipioOut>(`/api/v1/municipios/${id}`);
      return mapApiMunicipioToDomain(apiMunicipio);
    } catch (error) {
      if (error instanceof Error && (error as any).status === 404) {
        return null;
      }
      throw error;
    }
  }

  /**
   * Find municipios by departamento
   * Note: This is a client-side filter since the API doesn't support this filter directly
   */
  async findByDepartamento(departamentoId: string): Promise<Municipio[]> {
    const allMunicipios = await this.findAll();
    return allMunicipios.filter(
      (m) => m.departamentoId === departamentoId
    );
  }

  /**
   * Create municipio
   * @param data - Municipio data
   * @param userId - ID of the user creating the municipio
   */
  async create(data: CreateCatalogDto, userId: number): Promise<Municipio> {
    const apiData = mapDomainMunicipioCreateToApi(data, userId);
    const apiMunicipio = await apiRequest<ApiMunicipioOut>("/api/v1/municipios/", {
      method: "POST",
      body: JSON.stringify(apiData),
    });
    return mapApiMunicipioToDomain(apiMunicipio);
  }

  /**
   * Update municipio
   * @param data - Municipio data with ID
   * @param userId - ID of the user updating the municipio
   */
  async update(data: UpdateCatalogDto, userId: number): Promise<Municipio> {
    const apiData = mapDomainMunicipioUpdateToApi(data, userId);
    const apiMunicipio = await apiRequest<ApiMunicipioOut>(`/api/v1/municipios/${data.id}`, {
      method: "PUT",
      body: JSON.stringify(apiData),
    });
    return mapApiMunicipioToDomain(apiMunicipio);
  }

  /**
   * Delete municipio
   */
  async delete(id: string): Promise<void> {
    await apiRequest<void>(`/api/v1/municipios/${id}`, {
      method: "DELETE",
    });
  }
}

export const apiMunicipioRepository = new ApiMunicipioRepository();

