/**
 * Presentation Component: Interest-Power Matrix
 * Main visualization for stakeholder positioning
 */

import { useMemo, useState } from "react";
import { Actor } from "@/domain/entities/Actor";
import {
  MatrixMapping,
  QUADRANT_LABELS,
} from "@/domain/value-objects/MatrixMapping";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface InterestPowerMatrixProps {
  actors: Actor[];
  matrixMapping: MatrixMapping;
  onActorClick?: (actor: Actor) => void;
  colorBy?: "nivel_poder" | "relacion" | "categoria";
}

export const InterestPowerMatrix = ({
  actors,
  matrixMapping,
  onActorClick,
  colorBy = "nivel_poder",
}: InterestPowerMatrixProps) => {
  const [hoveredActor, setHoveredActor] = useState<string | null>(null);

  const config = matrixMapping.getConfig();

  // Filter actors that have position data (relación AND nivel de poder - ambos requeridos)
  const positionedActors = useMemo(
    () =>
      actors.filter(
        (a) => a.relacion !== undefined && a.nivel_poder !== undefined
      ),
    [actors]
  );

  // Calculate quadrant counts
  const quadrantCounts = useMemo(() => {
    const counts = {
      "high-high": 0,
      "high-low": 0,
      "low-high": 0,
      "low-low": 0,
    };

    positionedActors.forEach((actor) => {
      const interes = matrixMapping.mapRelacionToInteres(actor.relacion);
      const poder = matrixMapping.mapPoderToValue(actor.nivel_poder);

      // Solo contar si ambos valores están definidos
      if (interes !== undefined && poder !== undefined) {
        const quadrant = matrixMapping.getQuadrant(interes, poder);
        if (quadrant) {
          counts[quadrant]++;
        }
      }
    });

    return counts;
  }, [positionedActors, matrixMapping]);

  // Simple hash function for consistent offset generation
  const hashString = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash);
  };

  // Map qualitative values (relación + poder) to XY position in the matrix
  // with jitter to avoid overlapping
  const getActorPosition = (actor: Actor, index: number) => {
    if (!actor.relacion || !actor.nivel_poder) {
      return { left: 0, bottom: 0, offsetX: 0, offsetY: 0 };
    }

    const interes = matrixMapping.mapRelacionToInteres(actor.relacion); // X axis
    const poder = matrixMapping.mapPoderToValue(actor.nivel_poder); // Y axis

    // Generate consistent but small offset to avoid overlapping
    // Use a combination of actor ID and index for variety
    const hash = hashString(actor.id + index.toString());
    const angle = (hash % 360) * (Math.PI / 180); // Convert to radians
    const distance = 2 + (hash % 3); // 2-4% offset
    const offsetX = Math.cos(angle) * distance;
    const offsetY = Math.sin(angle) * distance;

    // Clamp to ensure points stay within bounds
    const finalX = Math.max(2, Math.min(98, interes + offsetX));
    const finalY = Math.max(2, Math.min(98, poder + offsetY));

    return {
      left: `${finalX}%`,
      bottom: `${finalY}%`,
      offsetX,
      offsetY,
    };
  };

  const getActorColor = (actor: Actor) => {
    if (colorBy === "nivel_poder") {
      const colors: Record<string, string> = {
        ALTO: "bg-red-500",
        MEDIO: "bg-yellow-500",
        BAJO: "bg-green-500",
      };
      return colors[actor.nivel_poder || ""] || "bg-gray-400";
    } else if (colorBy === "relacion") {
      const colors: Record<string, string> = {
        A_FAVOR: "bg-green-500",
        INDIFERENTE: "bg-yellow-500",
        EN_CONTRA: "bg-red-500",
      };
      return colors[actor.relacion || ""] || "bg-gray-400";
    } else if (colorBy === "categoria") {
      // Generate consistent color based on categoria name using a hash
      const categoria = actor.categoria || "sin_categoria";
      const hash = categoria.split("").reduce((acc, char) => {
        return char.charCodeAt(0) + ((acc << 5) - acc);
      }, 0);
      // Use a more vibrant color palette
      const hue = Math.abs(hash) % 360;
      const saturation = 65 + (Math.abs(hash) % 20); // 65-85%
      const lightness = 45 + (Math.abs(hash) % 15); // 45-60%
      return `bg-[hsl(${hue},${saturation}%,${lightness}%)]`;
    }
    return "bg-gray-400";
  };

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-foreground">
            Matriz Interés-Poder
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Posicionamiento de {positionedActors.length} actores
          </p>
        </div>

        {/* Matrix visualization */}
        <div className="relative w-full max-w-2xl mx-auto aspect-square border border-border rounded-lg overflow-hidden bg-background">
          {/* Quadrant backgrounds */}
          {/* Grid order: row 1 (top), row 2 (bottom); col 1 (left), col 2 (right) */}
          <div className="absolute inset-0 grid grid-cols-2 grid-rows-2">
            {/* High-Low (top-left) - Mantener conformes: Alto poder, Bajo interés (En contra) */}
            <div className="bg-quadrant-high-low border-r border-b border-border flex items-center justify-center p-4">
              <div className="text-center">
                <p className="text-xs font-semibold text-accent uppercase tracking-wide">
                  {QUADRANT_LABELS["high-low"]}
                </p>
                <p className="text-2xl font-bold text-accent mt-1">
                  {quadrantCounts["high-low"]}
                </p>
              </div>
            </div>

            {/* High-High (top-right) - Gestión conjunta: Alto poder, Alto interés (A favor) */}
            <div className="bg-quadrant-high-high border-b border-border flex items-center justify-center p-4">
              <div className="text-center">
                <p className="text-xs font-semibold text-success uppercase tracking-wide">
                  {QUADRANT_LABELS["high-high"]}
                </p>
                <p className="text-2xl font-bold text-success mt-1">
                  {quadrantCounts["high-high"]}
                </p>
              </div>
            </div>

            {/* Low-Low (bottom-left) - Mantener informados: Bajo poder, Bajo interés (En contra) */}
            <div className="bg-quadrant-low-low border-r border-border flex items-center justify-center p-4">
              <div className="text-center">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  {QUADRANT_LABELS["low-low"]}
                </p>
                <p className="text-2xl font-bold text-muted-foreground mt-1">
                  {quadrantCounts["low-low"]}
                </p>
              </div>
            </div>

            {/* Low-High (bottom-right) - Garantizar participación: Bajo poder, Alto interés (A favor) */}
            <div className="bg-quadrant-low-high flex items-center justify-center p-4">
              <div className="text-center">
                <p className="text-xs font-semibold text-primary uppercase tracking-wide">
                  {QUADRANT_LABELS["low-high"]}
                </p>
                <p className="text-2xl font-bold text-primary mt-1">
                  {quadrantCounts["low-high"]}
                </p>
              </div>
            </div>
          </div>

          {/* Center lines */}
          <div
            className="absolute inset-x-0 border-t-2 border-foreground/20"
            style={{ bottom: `${config.thresholds.poder}%` }}
          />
          <div
            className="absolute inset-y-0 border-l-2 border-foreground/20"
            style={{ left: `${config.thresholds.interes}%` }}
          />

          {/* Actor points */}
          <TooltipProvider>
            {positionedActors.map((actor, index) => {
              // Solo renderizar si el actor tiene ambos valores
              if (!actor.relacion || !actor.nivel_poder) {
                return null;
              }

              const interes = matrixMapping.mapRelacionToInteres(actor.relacion);
              const poder = matrixMapping.mapPoderToValue(actor.nivel_poder);

              // Solo renderizar si ambos valores están definidos
              if (interes === undefined || poder === undefined) {
                return null;
              }

              const position = getActorPosition(actor, index);
              const isHovered = hoveredActor === actor.id;

              return (
                <Tooltip key={actor.id}>
                  <TooltipTrigger asChild>
                    <button
                      className={`absolute w-3 h-3 rounded-full ${getActorColor(
                        actor
                      )} cursor-pointer transition-all duration-200 hover:scale-150 hover:z-10 ${
                        isHovered ? "scale-150 z-10 ring-2 ring-foreground" : ""
                      }`}
                      style={{
                        left: position.left,
                        bottom: position.bottom,
                        transform: "translate(-50%, 50%)",
                      }}
                      onClick={() => onActorClick?.(actor)}
                      onMouseEnter={() => setHoveredActor(actor.id)}
                      onMouseLeave={() => setHoveredActor(null)}
                    />
                  </TooltipTrigger>
                  <TooltipContent side="top" className="max-w-xs">
                    <div className="space-y-1">
                      <p className="font-semibold">{actor.nombre}</p>
                      <p className="text-xs text-muted-foreground">
                        {actor.cargo}
                      </p>
                      <p className="text-xs">{actor.organizacion}</p>
                      <div className="flex gap-2 mt-2">
                        <Badge variant="outline" className="text-xs">
                          {actor.categoria}
                        </Badge>
                        {actor.nivel_poder && (
                          <Badge variant="secondary" className="text-xs">
                            {actor.nivel_poder.replace("_", " ")}
                          </Badge>
                        )}
                        {actor.relacion && (
                          <Badge variant="secondary" className="text-xs">
                            {actor.relacion.replace("_", " ")}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </TooltipProvider>

          {/* Axis labels */}
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-xs font-medium text-muted-foreground bg-background/80 px-2 py-1 rounded">
            <span className="mr-2">En contra</span>
            <span className="font-semibold">Interés</span>
            <span className="ml-2">A favor</span>
          </div>
          <div className="absolute left-2 top-1/2 -translate-y-1/2 -rotate-90 text-xs font-medium text-muted-foreground bg-background/80 px-2 py-1 rounded whitespace-nowrap">
            <span className="mr-2">Bajo</span>
            <span className="font-semibold">Poder</span>
            <span className="ml-2">Alto</span>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-3 justify-center">
          {colorBy === "nivel_poder" && (
            <>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <span className="text-xs text-muted-foreground">Alto Poder</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <span className="text-xs text-muted-foreground">Medio Poder</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <span className="text-xs text-muted-foreground">Bajo Poder</span>
              </div>
            </>
          )}
          {colorBy === "relacion" && (
            <>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <span className="text-xs text-muted-foreground">A Favor</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <span className="text-xs text-muted-foreground">Indiferente</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <span className="text-xs text-muted-foreground">En Contra</span>
              </div>
            </>
          )}
          {colorBy === "categoria" && (() => {
            // Get unique categorias from positioned actors
            const uniqueCategorias = Array.from(
              new Set(positionedActors.map(a => a.categoria).filter(Boolean))
            ).sort();
            
            return (
              <div className="flex flex-wrap gap-3 justify-center max-w-2xl">
                {uniqueCategorias.map((cat) => {
                  const hash = (cat || "").split("").reduce((acc, char) => {
                    return char.charCodeAt(0) + ((acc << 5) - acc);
                  }, 0);
                  const hue = Math.abs(hash) % 360;
                  const saturation = 65 + (Math.abs(hash) % 20);
                  const lightness = 45 + (Math.abs(hash) % 15);
                  
                  return (
                    <div key={cat} className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: `hsl(${hue},${saturation}%,${lightness}%)` }}
                      />
                      <span className="text-xs text-muted-foreground">{cat}</span>
                    </div>
                  );
                })}
              </div>
            );
          })()}
        </div>
      </div>
    </Card>
  );
};
