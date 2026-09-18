/**
 * Page: Dashboard
 * Main dashboard with Interest-Power Matrix
 */

import { useState, useMemo, memo, useCallback } from "react";
import { useActors } from "@/presentation/hooks/useActors";
import { InterestPowerMatrix } from "@/presentation/components/matrix/InterestPowerMatrix";
import { MatrixFilters } from "@/presentation/components/matrix/MatrixFilters";
import { MatrixMapping } from "@/domain/value-objects/MatrixMapping";
import { Actor } from "@/domain/entities/Actor";
import { ActorsFilterParams } from "@/domain/repositories/ActorRepository";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Users, TrendingUp, AlertCircle, CheckCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// Memoizar el header para evitar re-renders innecesarios
const DashboardHeader = memo(() => {
  return (
    <div>
      <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
      <p className="text-muted-foreground mt-1">
        Visualización y análisis de stakeholders (datos ficticios de demo)
      </p>
    </div>
  );
});
DashboardHeader.displayName = "DashboardHeader";

// Componente de tarjeta de estadística con loading individual
interface StatCardProps {
  label: string;
  value: number;
  icon: React.ReactNode;
  colorClass: string;
  isLoading?: boolean;
}

const StatCard = memo(({ label, value, icon, colorClass, isLoading }: StatCardProps) => {
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          {isLoading ? (
            <Skeleton className="h-9 w-16 mt-1" />
          ) : (
            <p className={`text-3xl font-bold ${colorClass} mt-1`}>{value}</p>
          )}
        </div>
        {icon}
      </div>
    </Card>
  );
});
StatCard.displayName = "StatCard";

const Dashboard = () => {
  const [populationFilters, setPopulationFilters] = useState<ActorsFilterParams>({});
  const [colorFilter, setColorFilter] = useState<"nivel_poder" | "relacion" | "categoria">("nivel_poder");
  
  // Build filters for API call (exclude color filter as it's only for visualization)
  const apiFilters = useMemo(() => {
    return {
      ...populationFilters,
      page: 1,
      page_size: 1000, // Get a large page for dashboard
    };
  }, [populationFilters]);

  const { actors, isLoading } = useActors({ filters: apiFilters });
  const [selectedActor, setSelectedActor] = useState<Actor | null>(null);
  const matrixMapping = useMemo(() => new MatrixMapping(), []);

  // Calculate stats - memoizado para evitar recálculos innecesarios
  const stats = useMemo(() => {
    return {
      total: actors.length,
      aFavor: actors.filter((a) => a.relacion === "A_FAVOR").length,
      enContra: actors.filter((a) => a.relacion === "EN_CONTRA").length,
      indiferente: actors.filter((a) => a.relacion === "INDIFERENTE").length,
    };
  }, [actors]);

  const handleActorClick = useCallback((actor: Actor) => {
    setSelectedActor(actor);
  }, []);

  const handleFiltersChange = useCallback((filters: ActorsFilterParams) => {
    setPopulationFilters(filters);
  }, []);

  const handleColorFilterChange = useCallback((colorFilter: "nivel_poder" | "relacion" | "categoria") => {
    setColorFilter(colorFilter);
  }, []);

  return (
    <div className="space-y-6">
      {/* Header - Memoizado */}
      <DashboardHeader />

      {/* Stats Cards - Con loading individual */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Actores"
          value={stats.total}
          icon={<Users className="w-8 h-8 text-primary" />}
          colorClass="text-foreground"
          isLoading={isLoading}
        />
        <StatCard
          label="A Favor"
          value={stats.aFavor}
          icon={<CheckCircle className="w-8 h-8 text-success" />}
          colorClass="text-success"
          isLoading={isLoading}
        />
        <StatCard
          label="En Contra"
          value={stats.enContra}
          icon={<AlertCircle className="w-8 h-8 text-destructive" />}
          colorClass="text-destructive"
          isLoading={isLoading}
        />
        <StatCard
          label="Indiferente"
          value={stats.indiferente}
          icon={<TrendingUp className="w-8 h-8 text-warning" />}
          colorClass="text-warning"
          isLoading={isLoading}
        />
      </div>

      {/* Filters */}
      <MatrixFilters
        filters={populationFilters}
        onFiltersChange={handleFiltersChange}
        colorFilter={colorFilter}
        onColorFilterChange={handleColorFilterChange}
      />

      {/* Matrix - Con skeleton solo cuando está cargando */}
      {isLoading ? (
        <Card className="p-6">
          <div className="space-y-6">
            <div>
              <Skeleton className="h-8 w-64 mb-2" />
              <Skeleton className="h-4 w-48" />
            </div>
            <div className="relative w-full max-w-2xl mx-auto aspect-square border border-border rounded-lg overflow-hidden bg-background">
              <Skeleton className="absolute inset-0" />
            </div>
            <div className="flex justify-center gap-3">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>
        </Card>
      ) : (
        <InterestPowerMatrix
          actors={actors}
          matrixMapping={matrixMapping}
          onActorClick={handleActorClick}
          colorBy={colorFilter}
        />
      )}

      {/* Actor Detail Dialog */}
      <Dialog 
        open={!!selectedActor} 
        onOpenChange={(open) => !open && setSelectedActor(null)}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalle del Actor</DialogTitle>
          </DialogHeader>
          {selectedActor && (
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-semibold">{selectedActor.nombre}</h3>
                <p className="text-muted-foreground">{selectedActor.cargo}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Organización</p>
                  <p className="text-sm">{selectedActor.organizacion}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Categoría</p>
                  <Badge>{selectedActor.categoria}</Badge>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Correo</p>
                  <a href={`mailto:${selectedActor.correo}`} className="text-sm text-primary hover:underline">
                    {selectedActor.correo}
                  </a>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Celular</p>
                  <a href={`tel:${selectedActor.celular}`} className="text-sm text-primary hover:underline">
                    {selectedActor.celular}
                  </a>
                </div>
                {selectedActor.relacion && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Relación</p>
                    <Badge variant="secondary">
                      {selectedActor.relacion.replace("_", " ")}
                    </Badge>
                  </div>
                )}
                {selectedActor.nivel_poder && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Nivel de Poder</p>
                    <Badge variant="outline">
                      {selectedActor.nivel_poder?.replace("_", " ")}
                    </Badge>
                  </div>
                )}
              </div>

              {selectedActor.observaciones && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Observaciones</p>
                  <p className="text-sm mt-1">{selectedActor.observaciones}</p>
                </div>
              )}

              {selectedActor.organizacion && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Ubicación</p>
                  <p className="text-sm mt-1">
                    {selectedActor.organizacion || ""}
                  </p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Dashboard;
