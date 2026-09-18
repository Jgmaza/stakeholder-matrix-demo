/**
 * Infrastructure: API Actor Repository
 * Real API implementation for actor data operations
 */

import { Actor, CreateActorDto, UpdateActorDto } from "@/domain/entities/Actor";
import { ActorRepository, ActorsFilterParams, PaginatedActorsResult } from "@/domain/repositories/ActorRepository";
import { apiRequest, PaginatedActorsResponse } from "../services/apiService";
import {
  mapApiActorToDomain,
  mapDomainCreateToApi,
  ApiActorOut,
} from "../mappers/actorMapper";

export class ApiActorRepository implements ActorRepository {
  /**
   * Get all actors (without pagination - for backward compatibility)
   * Note: The API now always returns paginated responses, so we fetch all pages
   */
  async findAll(): Promise<Actor[]> {
    const allActors: Actor[] = [];
    let currentPage = 1;
    const pageSize = 1000; // Maximum allowed by API
    let hasMorePages = true;

    while (hasMorePages) {
      const response = await apiRequest<PaginatedActorsResponse>(
        `/api/v1/actores/?page=${currentPage}&page_size=${pageSize}`
      );
      
      // Map and add actors from this page
      const pageActors = response.items.map((actor) => mapApiActorToDomain(actor as ApiActorOut));
      allActors.push(...pageActors);

      // Check if there are more pages
      hasMorePages = currentPage < response.total_pages;
      currentPage++;
    }

    // Note: Catalog enrichment is done in the hook useActors
    return allActors;
  }

  /**
   * Get all actors with filters and pagination
   */
  async findAllWithFilters(filters: ActorsFilterParams): Promise<PaginatedActorsResult> {
    const queryParams = new URLSearchParams();
    
    if (filters.page !== undefined) {
      queryParams.append("page", String(filters.page));
    }
    if (filters.page_size !== undefined) {
      queryParams.append("page_size", String(filters.page_size));
    }
    if (filters.nombre) {
      queryParams.append("nombre", filters.nombre);
    }
    if (filters.categoria_id !== undefined && filters.categoria_id !== null) {
      queryParams.append("categoria_id", String(filters.categoria_id));
    }
    if (filters.organizacion_id !== undefined && filters.organizacion_id !== null) {
      queryParams.append("organizacion_id", String(filters.organizacion_id));
    }
    if (filters.cargo_id !== undefined && filters.cargo_id !== null) {
      queryParams.append("cargo_id", String(filters.cargo_id));
    }
    if (filters.nivel_poder) {
      queryParams.append("nivel_poder", filters.nivel_poder);
    }
    if (filters.nivel) {
      queryParams.append("nivel", filters.nivel);
    }
    if (filters.relacion) {
      queryParams.append("relacion", filters.relacion);
    }
    if (filters.celular) {
      queryParams.append("celular", filters.celular);
    }
    if (filters.correo) {
      queryParams.append("correo", filters.correo);
    }

    const queryString = queryParams.toString();
    const url = `/api/v1/actores/${queryString ? `?${queryString}` : ""}`;
    
    const response = await apiRequest<PaginatedActorsResponse>(url);
    
    return {
      items: response.items.map((actor) => mapApiActorToDomain(actor as ApiActorOut)),
      total: response.total,
      page: response.page,
      page_size: response.page_size,
      total_pages: response.total_pages,
    };
  }

  /**
   * Get actor by ID
   */
  async findById(id: string): Promise<Actor | null> {
    try {
      const apiActor = await apiRequest<ApiActorOut>(`/api/v1/actores/${id}`);
      // Note: Catalog enrichment is done in the hook useActors
      return mapApiActorToDomain(apiActor);
    } catch (error) {
      if (error instanceof Error && (error as any).status === 404) {
        return null;
      }
      throw error;
    }
  }

  /**
   * Create actor
   * @param data - Actor data
   * @param userId - ID of the user creating the actor
   */
  async create(data: CreateActorDto, userId: number): Promise<Actor> {
    const apiData = mapDomainCreateToApi(data);
    const apiActor = await apiRequest<ApiActorOut>("/api/v1/actores/", {
      method: "POST",
      body: JSON.stringify(apiData),
    });
    // Note: Catalog enrichment is done in the hook useActors
    return mapApiActorToDomain(apiActor);
  }

  /**
   * Update actor
   * @param data - Actor data with ID
   * @param userId - ID of the user updating the actor
   */
  async update(data: UpdateActorDto, userId: number): Promise<Actor> {
    const apiData = mapDomainCreateToApi(data as CreateActorDto);
    const apiActor = await apiRequest<ApiActorOut>(`/api/v1/actores/${data.id}`, {
      method: "PUT",
      body: JSON.stringify(apiData),
    });
    // Note: Catalog enrichment is done in the hook useActors
    return mapApiActorToDomain(apiActor);
  }

  /**
   * Find actors by organization
   * Note: This is a client-side filter since the API doesn't support this filter
   */
  async findByOrganization(organizacion: string): Promise<Actor[]> {
    const allActors = await this.findAll();
    return allActors.filter(
      (a) => a.organizacion_id?.toLowerCase() === organizacion.toLowerCase()
    );
  }

  /**
   * Find actors by category
   * Note: This is a client-side filter since the API doesn't support this filter
   */
  async findByCategory(categoria: string): Promise<Actor[]> {
    const allActors = await this.findAll();
    return allActors.filter(
      (a) => a.categoria_id?.toLowerCase() === categoria.toLowerCase()
    );
  }

  /**
   * Find actors by distrito
   * Note: This is a client-side filter since the API doesn't support this filter
   */
  /**
   * Delete actor
   */
  async delete(id: string): Promise<void> {
    await apiRequest<void>(`/api/v1/actores/${id}`, {
      method: "DELETE",
    });
  }
}

export const apiActorRepository = new ApiActorRepository();

