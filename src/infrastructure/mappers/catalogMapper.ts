/**
 * Infrastructure Mappers: Catalog Mapper
 * Maps between domain Catalog models and API models
 */

import { Organization, Distrito, Municipio, TipoOrganizacion, Categoria, Cargo, CreateCatalogDto, UpdateCatalogDto } from "@/domain/entities/Catalog";

// API Types (from Swagger)
interface ApiDistritoOut {
  id: number;
  nombre: string;
  municipios?: ApiMunicipioOut[];
}

interface ApiDistritoCreate {
  nombre: string;
  creado_por: number;
  actualizado_por: number;
}

interface ApiDistritoUpdate {
  nombre?: string | null;
  actualizado_por?: number | null;
}

interface ApiMunicipioOut {
  id: number;
  nombre: string;
  departamento: string;
  distrito_id: number;
}

interface ApiMunicipioCreate {
  nombre: string;
  departamento: string;
  distrito_id: number;
  creado_por: number;
  actualizado_por: number;
}

interface ApiMunicipioUpdate {
  nombre?: string | null;
  departamento?: string | null;
  distrito_id?: number | null;
  actualizado_por?: number | null;
}

interface ApiOrganizacionOut {
  id: number;
  nombre: string;
  municipio_id: number;
  tipo_organizacion_id: number;
}

interface ApiOrganizacionCreate {
  nombre: string;
  municipio_id: number;
  tipo_organizacion_id: number;
  creado_por: number;
  actualizado_por: number;
}

interface ApiOrganizacionUpdate {
  nombre?: string | null;
  municipio_id?: number | null;
  tipo_organizacion_id?: number | null;
  actualizado_por?: number | null;
}

interface ApiTipoOrganizacionOut {
  id: number;
  nombre: string;
}

interface ApiTipoOrganizacionCreate {
  nombre: string;
  creado_por: number;
  actualizado_por: number;
}

interface ApiTipoOrganizacionUpdate {
  nombre?: string | null;
  actualizado_por?: number | null;
}

interface ApiCategoriaOut {
  id: number;
  nombre: string;
}

interface ApiCategoriaCreate {
  nombre: string;
  creado_por: number;
  actualizado_por: number;
}

interface ApiCategoriaUpdate {
  nombre?: string | null;
  actualizado_por?: number | null;
}

interface ApiCargoOut {
  id: number;
  nombre: string;
}

interface ApiCargoCreate {
  nombre: string;
  creado_por: number;
  actualizado_por: number;
}

interface ApiCargoUpdate {
  nombre?: string | null;
  actualizado_por?: number | null;
}

/**
 * Map API Distrito to Domain Distrito
 */
export function mapApiDistritoToDomain(apiDistrito: ApiDistritoOut): Distrito {
  return {
    id: apiDistrito.id.toString(),
    nombre: apiDistrito.nombre,
    createdAt: new Date(), // API doesn't provide this
    updatedAt: new Date(), // API doesn't provide this
  };
}

/**
 * Map Domain CreateCatalogDto to API DistritoCreate
 */
export function mapDomainDistritoCreateToApi(
  dto: CreateCatalogDto,
  userId: number
): ApiDistritoCreate {
  return {
    nombre: dto.nombre,
    creado_por: userId,
    actualizado_por: userId,
  };
}

/**
 * Map Domain UpdateCatalogDto to API DistritoUpdate
 */
export function mapDomainDistritoUpdateToApi(
  dto: UpdateCatalogDto,
  userId: number
): ApiDistritoUpdate {
  const update: ApiDistritoUpdate = {
    actualizado_por: userId,
  };

  if (dto.nombre !== undefined) {
    update.nombre = dto.nombre;
  }

  return update;
}

/**
 * Map API Municipio to Domain Municipio
 * Note: API uses distrito_id (the distrito the municipio belongs to) and departamento (string name)
 * Domain uses departamentoId which maps to distrito_id in the API
 */
export function mapApiMunicipioToDomain(apiMunicipio: ApiMunicipioOut): Municipio & { distritoId?: string } {
  return {
    id: apiMunicipio.id.toString(),
    nombre: apiMunicipio.nombre,
    departamentoId: apiMunicipio.distrito_id.toString(), // API's distrito_id maps to domain's departamentoId
    distritoId: apiMunicipio.distrito_id.toString(), // Add distritoId for form usage (same as departamentoId)
    codigo: apiMunicipio.departamento, // API's departamento (string) maps to domain's codigo
    createdAt: new Date(), // API doesn't provide this
    updatedAt: new Date(), // API doesn't provide this
  };
}

/**
 * Map Domain CreateCatalogDto to API MunicipioCreate
 */
export function mapDomainMunicipioCreateToApi(
  dto: CreateCatalogDto,
  userId: number
): ApiMunicipioCreate {
  if (!dto.distritoId) {
    throw new Error("distritoId is required for municipio");
  }

  return {
    nombre: dto.nombre,
    departamento: dto.departamentoId || dto.codigo || "", // Using departamentoId or codigo as departamento (string value)
    distrito_id: parseInt(dto.distritoId),
    creado_por: userId,
    actualizado_por: userId,
  };
}

/**
 * Map Domain UpdateCatalogDto to API MunicipioUpdate
 */
export function mapDomainMunicipioUpdateToApi(
  dto: UpdateCatalogDto,
  userId: number
): ApiMunicipioUpdate {
  const update: ApiMunicipioUpdate = {
    actualizado_por: userId,
  };

  if (dto.nombre !== undefined) {
    update.nombre = dto.nombre;
  }
  if (dto.departamentoId !== undefined) {
    update.departamento = dto.departamentoId;
  }
  if (dto.distritoId !== undefined) {
    update.distrito_id = dto.distritoId ? parseInt(dto.distritoId) : null;
  }

  return update;
}

/**
 * Map API Organizacion to Domain Organization
 */
export function mapApiOrganizacionToDomain(apiOrganizacion: ApiOrganizacionOut): Organization & { municipio_id?: string; tipo_organizacion_id?: string } {
  return {
    id: apiOrganizacion.id.toString(),
    nombre: apiOrganizacion.nombre,
    tipo: apiOrganizacion.tipo_organizacion_id.toString(), // Map tipo_organizacion_id to tipo
    municipio_id: apiOrganizacion.municipio_id.toString(), // Add municipio_id for form usage
    tipo_organizacion_id: apiOrganizacion.tipo_organizacion_id.toString(), // Add tipo_organizacion_id for form usage
    createdAt: new Date(), // API doesn't provide this
    updatedAt: new Date(), // API doesn't provide this
  };
}

/**
 * Map Domain CreateCatalogDto to API OrganizacionCreate
 */
export function mapDomainOrganizacionCreateToApi(
  dto: CreateCatalogDto,
  userId: number
): ApiOrganizacionCreate {
  // Note: API requires municipio_id and tipo_organizacion_id
  // The form uses municipio_id and tipo_organizacion_id directly
  const municipioId = (dto as any).municipio_id ? parseInt((dto as any).municipio_id) : (dto.departamentoId ? parseInt(dto.departamentoId) : 1);
  const tipoOrganizacionId = (dto as any).tipo_organizacion_id ? parseInt((dto as any).tipo_organizacion_id) : (dto.tipo ? parseInt(dto.tipo) : 1);

  return {
    nombre: dto.nombre,
    municipio_id: municipioId,
    tipo_organizacion_id: tipoOrganizacionId,
    creado_por: userId,
    actualizado_por: userId,
  };
}

/**
 * Map Domain UpdateCatalogDto to API OrganizacionUpdate
 */
export function mapDomainOrganizacionUpdateToApi(
  dto: UpdateCatalogDto,
  userId: number
): ApiOrganizacionUpdate {
  const update: ApiOrganizacionUpdate = {
    actualizado_por: userId,
  };

  if (dto.nombre !== undefined) {
    update.nombre = dto.nombre;
  }
  // Check for municipio_id first (from form), then fallback to departamentoId
  if ((dto as any).municipio_id !== undefined) {
    update.municipio_id = (dto as any).municipio_id ? parseInt((dto as any).municipio_id) : null;
  } else if (dto.departamentoId !== undefined) {
    update.municipio_id = dto.departamentoId ? parseInt(dto.departamentoId) : null;
  }
  // Check for tipo_organizacion_id first (from form), then fallback to tipo
  if ((dto as any).tipo_organizacion_id !== undefined) {
    update.tipo_organizacion_id = (dto as any).tipo_organizacion_id ? parseInt((dto as any).tipo_organizacion_id) : null;
  } else if (dto.tipo !== undefined) {
    update.tipo_organizacion_id = dto.tipo ? parseInt(dto.tipo) : null;
  }

  return update;
}

/**
 * Map API TipoOrganizacion to Domain TipoOrganizacion
 */
export function mapApiTipoOrganizacionToDomain(apiTipoOrganizacion: ApiTipoOrganizacionOut): TipoOrganizacion {
  return {
    id: apiTipoOrganizacion.id.toString(),
    nombre: apiTipoOrganizacion.nombre,
    createdAt: new Date(), // API doesn't provide this
    updatedAt: new Date(), // API doesn't provide this
  };
}

/**
 * Map Domain CreateCatalogDto to API TipoOrganizacionCreate
 */
export function mapDomainTipoOrganizacionCreateToApi(
  dto: CreateCatalogDto,
  userId: number
): ApiTipoOrganizacionCreate {
  return {
    nombre: dto.nombre,
    creado_por: userId,
    actualizado_por: userId,
  };
}

/**
 * Map Domain UpdateCatalogDto to API TipoOrganizacionUpdate
 */
export function mapDomainTipoOrganizacionUpdateToApi(
  dto: UpdateCatalogDto,
  userId: number
): ApiTipoOrganizacionUpdate {
  const update: ApiTipoOrganizacionUpdate = {
    actualizado_por: userId,
  };

  if (dto.nombre !== undefined) {
    update.nombre = dto.nombre;
  }

  return update;
}

/**
 * Map API Categoria to Domain Categoria
 */
export function mapApiCategoriaToDomain(apiCategoria: ApiCategoriaOut): Categoria {
  return {
    id: apiCategoria.id.toString(),
    nombre: apiCategoria.nombre,
    createdAt: new Date(), // API doesn't provide this
    updatedAt: new Date(), // API doesn't provide this
  };
}

/**
 * Map Domain CreateCatalogDto to API CategoriaCreate
 */
export function mapDomainCategoriaCreateToApi(
  dto: CreateCatalogDto,
  userId: number
): ApiCategoriaCreate {
  return {
    nombre: dto.nombre,
    creado_por: userId,
    actualizado_por: userId,
  };
}

/**
 * Map Domain UpdateCatalogDto to API CategoriaUpdate
 */
export function mapDomainCategoriaUpdateToApi(
  dto: UpdateCatalogDto,
  userId: number
): ApiCategoriaUpdate {
  const update: ApiCategoriaUpdate = {
    actualizado_por: userId,
  };

  if (dto.nombre !== undefined) {
    update.nombre = dto.nombre;
  }

  return update;
}

/**
 * Map API Cargo to Domain Cargo
 */
export function mapApiCargoToDomain(apiCargo: ApiCargoOut): Cargo {
  return {
    id: apiCargo.id.toString(),
    nombre: apiCargo.nombre,
    createdAt: new Date(), // API doesn't provide this
    updatedAt: new Date(), // API doesn't provide this
  };
}

/**
 * Map Domain CreateCatalogDto to API CargoCreate
 */
export function mapDomainCargoCreateToApi(
  dto: CreateCatalogDto,
  userId: number
): ApiCargoCreate {
  return {
    nombre: dto.nombre,
    creado_por: userId,
    actualizado_por: userId,
  };
}

/**
 * Map Domain UpdateCatalogDto to API CargoUpdate
 */
export function mapDomainCargoUpdateToApi(
  dto: UpdateCatalogDto,
  userId: number
): ApiCargoUpdate {
  const update: ApiCargoUpdate = {
    actualizado_por: userId,
  };

  if (dto.nombre !== undefined) {
    update.nombre = dto.nombre;
  }

  return update;
}

export type {
  ApiDistritoOut,
  ApiDistritoCreate,
  ApiDistritoUpdate,
  ApiMunicipioOut,
  ApiMunicipioCreate,
  ApiMunicipioUpdate,
  ApiOrganizacionOut,
  ApiOrganizacionCreate,
  ApiOrganizacionUpdate,
  ApiTipoOrganizacionOut,
  ApiTipoOrganizacionCreate,
  ApiTipoOrganizacionUpdate,
  ApiCategoriaOut,
  ApiCategoriaCreate,
  ApiCategoriaUpdate,
  ApiCargoOut,
  ApiCargoCreate,
  ApiCargoUpdate,
};

