/**
 * Application Use Cases: Catalog
 * Export all catalog-related use cases
 */

import { apiDistritoRepository } from "@/infrastructure/repositories/ApiDistritoRepository";
import { apiMunicipioRepository } from "@/infrastructure/repositories/ApiMunicipioRepository";
import { apiOrganizacionRepository } from "@/infrastructure/repositories/ApiOrganizacionRepository";
import { apiTipoOrganizacionRepository } from "@/infrastructure/repositories/ApiTipoOrganizacionRepository";
import { apiCategoriaRepository } from "@/infrastructure/repositories/ApiCategoriaRepository";
import { apiCargoRepository } from "@/infrastructure/repositories/ApiCargoRepository";
import { GetAllDistritos } from "./GetAllDistritos";
import { CreateDistrito } from "./CreateDistrito";
import { UpdateDistrito } from "./UpdateDistrito";
import { DeleteDistrito } from "./DeleteDistrito";
import { GetAllMunicipios } from "./GetAllMunicipios";
import { CreateMunicipio } from "./CreateMunicipio";
import { UpdateMunicipio } from "./UpdateMunicipio";
import { DeleteMunicipio } from "./DeleteMunicipio";
import { GetAllOrganizaciones } from "./GetAllOrganizaciones";
import { CreateOrganizacion } from "./CreateOrganizacion";
import { UpdateOrganizacion } from "./UpdateOrganizacion";
import { DeleteOrganizacion } from "./DeleteOrganizacion";
import { GetAllTiposOrganizaciones } from "./GetAllTiposOrganizaciones";
import { CreateTipoOrganizacion } from "./CreateTipoOrganizacion";
import { UpdateTipoOrganizacion } from "./UpdateTipoOrganizacion";
import { DeleteTipoOrganizacion } from "./DeleteTipoOrganizacion";
import { GetAllCategorias } from "./GetAllCategorias";
import { CreateCategoria } from "./CreateCategoria";
import { UpdateCategoria } from "./UpdateCategoria";
import { DeleteCategoria } from "./DeleteCategoria";
import { GetAllCargos } from "./GetAllCargos";
import { CreateCargo } from "./CreateCargo";
import { UpdateCargo } from "./UpdateCargo";
import { DeleteCargo } from "./DeleteCargo";

// Export use case instances (using real API repositories)
export const getAllDistritos = new GetAllDistritos(apiDistritoRepository);
export const createDistrito = new CreateDistrito(apiDistritoRepository);
export const updateDistrito = new UpdateDistrito(apiDistritoRepository);
export const deleteDistrito = new DeleteDistrito(apiDistritoRepository);

export const getAllMunicipios = new GetAllMunicipios(apiMunicipioRepository);
export const createMunicipio = new CreateMunicipio(apiMunicipioRepository);
export const updateMunicipio = new UpdateMunicipio(apiMunicipioRepository);
export const deleteMunicipio = new DeleteMunicipio(apiMunicipioRepository);

export const getAllOrganizaciones = new GetAllOrganizaciones(apiOrganizacionRepository);
export const createOrganizacion = new CreateOrganizacion(apiOrganizacionRepository);
export const updateOrganizacion = new UpdateOrganizacion(apiOrganizacionRepository);
export const deleteOrganizacion = new DeleteOrganizacion(apiOrganizacionRepository);

export const getAllTiposOrganizaciones = new GetAllTiposOrganizaciones(apiTipoOrganizacionRepository);
export const createTipoOrganizacion = new CreateTipoOrganizacion(apiTipoOrganizacionRepository);
export const updateTipoOrganizacion = new UpdateTipoOrganizacion(apiTipoOrganizacionRepository);
export const deleteTipoOrganizacion = new DeleteTipoOrganizacion(apiTipoOrganizacionRepository);

export const getAllCategorias = new GetAllCategorias(apiCategoriaRepository);
export const createCategoria = new CreateCategoria(apiCategoriaRepository);
export const updateCategoria = new UpdateCategoria(apiCategoriaRepository);
export const deleteCategoria = new DeleteCategoria(apiCategoriaRepository);

export const getAllCargos = new GetAllCargos(apiCargoRepository);
export const createCargo = new CreateCargo(apiCargoRepository);
export const updateCargo = new UpdateCargo(apiCargoRepository);
export const deleteCargo = new DeleteCargo(apiCargoRepository);

// Export use case classes for testing
export {
  GetAllDistritos,
  CreateDistrito,
  UpdateDistrito,
  DeleteDistrito,
  GetAllMunicipios,
  CreateMunicipio,
  UpdateMunicipio,
  DeleteMunicipio,
  GetAllOrganizaciones,
  CreateOrganizacion,
  UpdateOrganizacion,
  DeleteOrganizacion,
  GetAllTiposOrganizaciones,
  CreateTipoOrganizacion,
  UpdateTipoOrganizacion,
  DeleteTipoOrganizacion,
  GetAllCategorias,
  CreateCategoria,
  UpdateCategoria,
  DeleteCategoria,
  GetAllCargos,
  CreateCargo,
  UpdateCargo,
  DeleteCargo,
};

