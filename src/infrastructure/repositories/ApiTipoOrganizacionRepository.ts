/**
 * Infrastructure: API Tipo Organizacion Repository
 * Real API implementation for tipo organizacion data operations
 */

import { TipoOrganizacion, CreateCatalogDto, UpdateCatalogDto } from "@/domain/entities/Catalog";
import { TipoOrganizacionRepository } from "@/domain/repositories/CatalogRepository";
import { apiRequest } from "../services/apiService";
import {
  mapApiTipoOrganizacionToDomain,
  mapDomainTipoOrganizacionCreateToApi,
  mapDomainTipoOrganizacionUpdateToApi,
  ApiTipoOrganizacionOut,
} from "../mappers/catalogMapper";

export class ApiTipoOrganizacionRepository implements TipoOrganizacionRepository {
  /**
   * Get all tipos organizaciones
   */
  async findAll(): Promise<TipoOrganizacion[]> {
    const apiTiposOrganizaciones = await apiRequest<ApiTipoOrganizacionOut[]>("/api/v1/tipos-organizaciones/");
    return apiTiposOrganizaciones.map(mapApiTipoOrganizacionToDomain);
  }

  /**
   * Get tipo organizacion by ID
   */
  async findById(id: string): Promise<TipoOrganizacion | null> {
    try {
      const apiTipoOrganizacion = await apiRequest<ApiTipoOrganizacionOut>(`/api/v1/tipos-organizaciones/${id}`);
      return mapApiTipoOrganizacionToDomain(apiTipoOrganizacion);
    } catch (error) {
      if (error instanceof Error && (error as any).status === 404) {
        return null;
      }
      throw error;
    }
  }

  /**
   * Create tipo organizacion
   * @param data - Tipo organizacion data
   * @param userId - ID of the user creating the tipo organizacion
   */
  async create(data: CreateCatalogDto, userId: number): Promise<TipoOrganizacion> {
    const apiData = mapDomainTipoOrganizacionCreateToApi(data, userId);
    const apiTipoOrganizacion = await apiRequest<ApiTipoOrganizacionOut>("/api/v1/tipos-organizaciones/", {
      method: "POST",
      body: JSON.stringify(apiData),
    });
    return mapApiTipoOrganizacionToDomain(apiTipoOrganizacion);
  }

  /**
   * Update tipo organizacion
   * @param data - Tipo organizacion data with ID
   * @param userId - ID of the user updating the tipo organizacion
   */
  async update(data: UpdateCatalogDto, userId: number): Promise<TipoOrganizacion> {
    const apiData = mapDomainTipoOrganizacionUpdateToApi(data, userId);
    const apiTipoOrganizacion = await apiRequest<ApiTipoOrganizacionOut>(`/api/v1/tipos-organizaciones/${data.id}`, {
      method: "PUT",
      body: JSON.stringify(apiData),
    });
    return mapApiTipoOrganizacionToDomain(apiTipoOrganizacion);
  }

  /**
   * Delete tipo organizacion
   */
  async delete(id: string): Promise<void> {
    await apiRequest<void>(`/api/v1/tipos-organizaciones/${id}`, {
      method: "DELETE",
    });
  }
}

export const apiTipoOrganizacionRepository = new ApiTipoOrganizacionRepository();

