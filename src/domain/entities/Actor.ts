/**
 * Domain Entity: Actor
 * Represents a stakeholder in the stakeholder domain
 */

export type ActorRelation = "A_FAVOR" | "EN_CONTRA" | "INDIFERENTE";
export type PowerLevel = "ALTO" | "MEDIO" | "BAJO";
export type Level = "PRIMER_NIVEL" | "SEGUNDO_NIVEL" | "TERCER_NIVEL";

export interface Actor {
  id: string;
  nombre: string;
  categoria_id: string;
  organizacion_id: string;
  cargo_id: string;
  celular: string;
  correo: string;
  observaciones?: string;
  
  relacion?: ActorRelation;
  nivel?: Level;
  nivel_poder?: PowerLevel;

  funciones?: string;
  relacion_predominante?: string;
  jerarquizacion_poder?: string;
  analisis_actor?: string;
  reconocimiento_redes?: string;
  
  // Metadata
  created_at: Date;
  updated_at: Date;

  // Relationships
  categoria?: string;
  organizacion?: string;
  cargo?: string;
}

export interface CreateActorDto {
  nombre: string;
  categoria_id: string; // ID from categorias catalog
  organizacion_id?: string; // ID from organizaciones catalog
  cargo_id?: string; // ID from cargos catalog
  celular?: string;
  correo?: string;
  observaciones?: string;
  relacion?: ActorRelation;
  nivel?: Level;
  nivel_poder?: PowerLevel;
}

export interface UpdateActorDto extends Partial<CreateActorDto> {
  id: string;
}
