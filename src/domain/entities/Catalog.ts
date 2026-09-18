/**
 * Domain Entities: Catalogs
 * Organizations, Districts, Departments, and Municipalities
 */

export interface Organization {
  id: string;
  nombre: string;
  tipo?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Distrito {
  id: string;
  nombre: string;
  codigo?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Municipio {
  id: string;
  nombre: string;
  departamentoId: string;
  codigo?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TipoOrganizacion {
  id: string;
  nombre: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Categoria {
  id: string;
  nombre: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Cargo {
  id: string;
  nombre: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateCatalogDto {
  nombre: string;
  tipo?: string;
  codigo?: string;
  distritoId?: string;
  departamentoId?: string;
  municipio_id?: string;
  tipo_organizacion_id?: string;
}

export interface UpdateCatalogDto extends Partial<CreateCatalogDto> {
  id: string;
}
