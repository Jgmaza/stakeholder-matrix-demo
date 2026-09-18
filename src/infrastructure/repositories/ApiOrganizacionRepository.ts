/**
 * Infrastructure: API Organizacion Repository
 * Real API implementation for organizacion data operations
 */

import { Organization, CreateCatalogDto, UpdateCatalogDto } from "@/domain/entities/Catalog";
import { OrganizationRepository } from "@/domain/repositories/CatalogRepository";
import { apiRequest } from "../services/apiService";
import {
  mapApiOrganizacionToDomain,
  mapDomainOrganizacionCreateToApi,
  mapDomainOrganizacionUpdateToApi,
  ApiOrganizacionOut,
} from "../mappers/catalogMapper";

export class ApiOrganizacionRepository implements OrganizationRepository {
  /**
   * Get all organizaciones
   */
  async findAll(): Promise<Organization[]> {
    const apiOrganizaciones = await apiRequest<ApiOrganizacionOut[]>("/api/v1/organizaciones/");
    return apiOrganizaciones.map(mapApiOrganizacionToDomain);
  }

  /**
   * Get organizacion by ID
   */
  async findById(id: string): Promise<Organization | null> {
    try {
      const apiOrganizacion = await apiRequest<ApiOrganizacionOut>(`/api/v1/organizaciones/${id}`);
      return mapApiOrganizacionToDomain(apiOrganizacion);
    } catch (error) {
      if (error instanceof Error && (error as any).status === 404) {
        return null;
      }
      throw error;
    }
  }

  /**
   * Create organizacion
   * @param data - Organizacion data
   * @param userId - ID of the user creating the organizacion
   */
  async create(data: CreateCatalogDto, userId: number): Promise<Organization> {
    const apiData = mapDomainOrganizacionCreateToApi(data, userId);
    const apiOrganizacion = await apiRequest<ApiOrganizacionOut>("/api/v1/organizaciones/", {
      method: "POST",
      body: JSON.stringify(apiData),
    });
    return mapApiOrganizacionToDomain(apiOrganizacion);
  }

  /**
   * Update organizacion
   * @param data - Organizacion data with ID
   * @param userId - ID of the user updating the organizacion
   */
  async update(data: UpdateCatalogDto, userId: number): Promise<Organization> {
    const apiData = mapDomainOrganizacionUpdateToApi(data, userId);
    const apiOrganizacion = await apiRequest<ApiOrganizacionOut>(`/api/v1/organizaciones/${data.id}`, {
      method: "PUT",
      body: JSON.stringify(apiData),
    });
    return mapApiOrganizacionToDomain(apiOrganizacion);
  }

  /**
   * Delete organizacion
   */
  async delete(id: string): Promise<void> {
    await apiRequest<void>(`/api/v1/organizaciones/${id}`, {
      method: "DELETE",
    });
  }
}

export const apiOrganizacionRepository = new ApiOrganizacionRepository();

