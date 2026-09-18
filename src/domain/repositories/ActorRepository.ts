/**
 * Domain Repository Interface: ActorRepository
 * Defines the contract for actor data operations
 */

import { Actor, CreateActorDto, UpdateActorDto } from "../entities/Actor";

export interface ActorsFilterParams {
  page?: number;
  page_size?: number;
  nombre?: string | null;
  categoria_id?: number | null;
  organizacion_id?: number | null;
  cargo_id?: number | null;
  nivel_poder?: "ALTO" | "MEDIO" | "BAJO" | null;
  nivel?: "PRIMER_NIVEL" | "SEGUNDO_NIVEL" | "TERCER_NIVEL" | null;
  relacion?: "A_FAVOR" | "INDIFERENTE" | "EN_CONTRA" | null;
  celular?: string | null;
  correo?: string | null;
}

export interface PaginatedActorsResult {
  items: Actor[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface ActorRepository {
  findAll(): Promise<Actor[]>;
  findAllWithFilters(filters: ActorsFilterParams): Promise<PaginatedActorsResult>;
  findById(id: string): Promise<Actor | null>;
  create(data: CreateActorDto, userId: number): Promise<Actor>;
  update(data: UpdateActorDto, userId: number): Promise<Actor>;
  delete(id: string): Promise<void>;
  
  // Filtering methods (deprecated - use findAllWithFilters instead)
  findByOrganization(organizacion: string): Promise<Actor[]>;
  findByCategory(categoria: string): Promise<Actor[]>;
}
