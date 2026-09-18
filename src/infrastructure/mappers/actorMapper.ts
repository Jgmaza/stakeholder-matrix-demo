/**
 * Infrastructure Mappers: Actor Mapper
 * Maps between domain Actor model and API Actor model
 */

import { Actor, CreateActorDto, UpdateActorDto, ActorRelation, PowerLevel, Level } from "@/domain/entities/Actor";


interface ApiActorOut {
  id: number;
  nombre: string;
  categoria_id: number;
  organizacion_id: number | null;
  cargo_id: number | null;
  celular: string | null;
  correo: string | null;
  observaciones: string | null;
  relacion: ActorRelation | null;
  nivel_poder: PowerLevel | null;
  nivel: Level | null;
  created_at: Date;
  updated_at: Date;
}

// Mapper functions
function mapDomainNivelPoderToApi(nivelPoder?: PowerLevel): PowerLevel | null {
  if (!nivelPoder) return null;
  const mapping: Record<PowerLevel, PowerLevel> = {
    ALTO: "ALTO",
    MEDIO: "MEDIO",
    BAJO: "BAJO",
  };
  return mapping[nivelPoder];
}
    
function mapDomainNivelToApi(nivel?: Level): Level | null {
  if (!nivel) return null;
  const mapping: Record<Level, Level> = {
    PRIMER_NIVEL: "PRIMER_NIVEL",
    SEGUNDO_NIVEL: "SEGUNDO_NIVEL",
    TERCER_NIVEL: "TERCER_NIVEL",
  };
  return mapping[nivel];
}

function mapApiRelacionToDomain(relacion: ActorRelation): ActorRelation {
  const mapping: Record<ActorRelation, ActorRelation> = {
    A_FAVOR: "A_FAVOR",
    INDIFERENTE: "INDIFERENTE",
    EN_CONTRA: "EN_CONTRA",
  };
  return mapping[relacion];
}

function mapDomainRelacionToApi(relacion?: ActorRelation): ActorRelation | null {
  if (!relacion) return null;
  const mapping: Record<ActorRelation, ActorRelation> = {
    A_FAVOR: "A_FAVOR",
    INDIFERENTE: "INDIFERENTE",
    EN_CONTRA: "EN_CONTRA",
  };
  return mapping[relacion];
}

/**
 * Map API Actor to Domain Actor
 */
export function mapApiActorToDomain(
  apiActor: ApiActorOut,
  categorias?: Array<{ id: string; nombre: string }>,
  organizaciones?: Array<{ id: string; nombre: string }>
): Actor & { categoria_id?: string; organizacion_id?: string } {
  return {
    id: apiActor.id.toString(),
    nombre: apiActor.nombre,
    categoria_id: apiActor.categoria_id.toString(),
    organizacion_id: apiActor.organizacion_id?.toString() || "",
    cargo_id: apiActor.cargo_id?.toString() || "",
    celular: apiActor.celular || "",
    correo: apiActor.correo || "",
    observaciones: apiActor.observaciones || undefined,
    relacion: apiActor.relacion ? mapApiRelacionToDomain(apiActor.relacion) : undefined,
    nivel_poder: apiActor.nivel_poder ? mapDomainNivelPoderToApi(apiActor.nivel_poder) : undefined,
    nivel: apiActor.nivel ? mapDomainNivelToApi(apiActor.nivel) as Level : undefined,
    created_at: new Date(),
    updated_at: new Date(),
  };
}

/**
 * Map Domain CreateActorDto to API ActorCreate
 */
export function mapDomainCreateToApi(
  dto: CreateActorDto,
): ApiActorOut {
  return {
    id: 0,
    created_at: new Date(),
    updated_at: new Date(),
    nombre: dto.nombre,
    categoria_id: parseInt(dto.categoria_id),
    organizacion_id: dto.organizacion_id ? parseInt(dto.organizacion_id) : null,
    cargo_id: dto.cargo_id ? parseInt(dto.cargo_id) : null,
    celular: dto.celular || null,
    correo: dto.correo || null,
    nivel_poder: mapDomainNivelPoderToApi(dto.nivel_poder),
    nivel: mapDomainNivelToApi(dto.nivel) as Level | null,
    relacion: mapDomainRelacionToApi(dto.relacion) as ActorRelation | null,
    observaciones: dto.observaciones || null,
  };
}

export type { ApiActorOut };

