/**
 * Domain Repository Interface: CatalogRepository
 * Defines contracts for catalog data operations
 */

import { 
  Organization, 
  Distrito, 
  Departamento, 
  Municipio,
  TipoOrganizacion,
  Categoria,
  Cargo,
  CreateCatalogDto,
  UpdateCatalogDto
} from "../entities/Catalog";

export interface OrganizationRepository {
  findAll(): Promise<Organization[]>;
  findById(id: string): Promise<Organization | null>;
  create(data: CreateCatalogDto, userId: number): Promise<Organization>;
  update(data: UpdateCatalogDto, userId: number): Promise<Organization>;
  delete(id: string): Promise<void>;
}

export interface DistritoRepository {
  findAll(): Promise<Distrito[]>;
  findById(id: string): Promise<Distrito | null>;
  create(data: CreateCatalogDto, userId: number): Promise<Distrito>;
  update(data: UpdateCatalogDto, userId: number): Promise<Distrito>;
  delete(id: string): Promise<void>;
}

export interface DepartamentoRepository {
  findAll(): Promise<Departamento[]>;
  findById(id: string): Promise<Departamento | null>;
  findByDistrito(distritoId: string): Promise<Departamento[]>;
  create(data: CreateCatalogDto, userId: number): Promise<Departamento>;
  update(data: UpdateCatalogDto, userId: number): Promise<Departamento>;
  delete(id: string): Promise<void>;
}

export interface MunicipioRepository {
  findAll(): Promise<Municipio[]>;
  findById(id: string): Promise<Municipio | null>;
  findByDepartamento(departamentoId: string): Promise<Municipio[]>;
  create(data: CreateCatalogDto, userId: number): Promise<Municipio>;
  update(data: UpdateCatalogDto, userId: number): Promise<Municipio>;
  delete(id: string): Promise<void>;
}

export interface TipoOrganizacionRepository {
  findAll(): Promise<TipoOrganizacion[]>;
  findById(id: string): Promise<TipoOrganizacion | null>;
  create(data: CreateCatalogDto, userId: number): Promise<TipoOrganizacion>;
  update(data: UpdateCatalogDto, userId: number): Promise<TipoOrganizacion>;
  delete(id: string): Promise<void>;
}

export interface CategoriaRepository {
  findAll(): Promise<Categoria[]>;
  findById(id: string): Promise<Categoria | null>;
  create(data: CreateCatalogDto, userId: number): Promise<Categoria>;
  update(data: UpdateCatalogDto, userId: number): Promise<Categoria>;
  delete(id: string): Promise<void>;
}

export interface CargoRepository {
  findAll(): Promise<Cargo[]>;
  findById(id: string): Promise<Cargo | null>;
  create(data: CreateCatalogDto, userId: number): Promise<Cargo>;
  update(data: UpdateCatalogDto, userId: number): Promise<Cargo>;
  delete(id: string): Promise<void>;
}
