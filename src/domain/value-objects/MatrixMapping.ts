/**
 * Domain Value Object: Matrix Mapping
 * Handles the mapping between categorical values and matrix coordinates
 */

import { ActorRelation, PowerLevel } from "../entities/Actor";

export interface MatrixConfig {
  relacionMapping: Record<ActorRelation, number>;
  poderMapping: Record<PowerLevel, number>;
  thresholds: {
    interes: number; // 50 by default
    poder: number;   // 50 by default
  };
}

export const DEFAULT_MATRIX_CONFIG: MatrixConfig = {
  relacionMapping: {
    EN_CONTRA: 0,      // Izquierda (bajo interés)
    INDIFERENTE: 50,   // Centro
    A_FAVOR: 100,      // Derecha (alto interés)
  },
  poderMapping: {
    BAJO: 0,    // Abajo (bajo poder) - 0% desde bottom
    MEDIO: 50,  // Medio
    ALTO: 100,  // Arriba (alto poder) - 100% desde bottom
  },
  thresholds: {
    interes: 50,  // Threshold para dividir interés (En contra vs A favor)
    poder: 50,    // Threshold para dividir poder (Bajo vs Alto)
  },
};

export type Quadrant = 
  | "high-high"   // Gestión conjunta (high power, high interest)
  | "high-low"    // Mantener conformes (high power, low interest)
  | "low-high"    // Garantizar participación (low power, high interest)
  | "low-low";    // Mantener informados (low power, low interest)

export const QUADRANT_LABELS: Record<Quadrant, string> = {
  "high-high": "Gestión conjunta",
  "high-low": "Mantener conformes",
  "low-high": "Garantizar su participación",
  "low-low": "Mantener informados",
};

export class MatrixMapping {
  constructor(private config: MatrixConfig = DEFAULT_MATRIX_CONFIG) {}

  mapRelacionToInteres(relacion?: ActorRelation): number | undefined {
    if (!relacion) return undefined;
    return this.config.relacionMapping[relacion];
  }

  mapPoderToValue(nivelPoder?: PowerLevel): number | undefined {
    if (!nivelPoder) return undefined;
    return this.config.poderMapping[nivelPoder];
  }

  getQuadrant(interes?: number, poder?: number): Quadrant | null {
    if (interes === undefined || poder === undefined) return null;
    
    const highInteres = interes >= this.config.thresholds.interes;
    const highPoder = poder >= this.config.thresholds.poder;

    if (highPoder && highInteres) return "high-high";
    if (highPoder && !highInteres) return "high-low";
    if (!highPoder && highInteres) return "low-high";
    return "low-low";
  }

  updateConfig(newConfig: Partial<MatrixConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  getConfig(): MatrixConfig {
    return { ...this.config };
  }
}
