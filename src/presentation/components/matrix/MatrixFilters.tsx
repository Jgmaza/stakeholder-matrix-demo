/**
 * Presentation Component: Matrix Filters
 * Filter controls for the Interest-Power Matrix
 */

import { useMemo } from "react";
import { ActorsFilterParams } from "@/domain/repositories/ActorRepository";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCategorias } from "@/presentation/hooks/useCategorias";
import { useOrganizaciones } from "@/presentation/hooks/useOrganizaciones";
import { useCargos } from "@/presentation/hooks/useCargos";
import { Filter, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MatrixFiltersProps {
  filters: ActorsFilterParams;
  onFiltersChange: (filters: ActorsFilterParams) => void;
  colorFilter: "nivel_poder" | "relacion" | "categoria";
  onColorFilterChange: (colorFilter: "nivel_poder" | "relacion" | "categoria") => void;
}

export const MatrixFilters = ({
  filters,
  onFiltersChange,
  colorFilter,
  onColorFilterChange,
}: MatrixFiltersProps) => {
  const { categorias } = useCategorias();
  const { organizaciones } = useOrganizaciones();
  const { cargos } = useCargos();

  const hasActiveFilters = useMemo(() => {
    return !!(
      filters.categoria_id ||
      filters.organizacion_id ||
      filters.cargo_id ||
      filters.nivel ||
      filters.relacion
    );
  }, [filters]);

  const handleFilterChange = (key: keyof ActorsFilterParams, value: string | null) => {
    if (value === "all" || value === "") {
      onFiltersChange({
        ...filters,
        [key]: null,
      });
    } else {
      // Convert to number for ID fields
      if (key === "categoria_id" || key === "organizacion_id" || key === "cargo_id") {
        onFiltersChange({
          ...filters,
          [key]: parseInt(value, 10),
        });
      } else {
        onFiltersChange({
          ...filters,
          [key]: value,
        });
      }
    }
  };

  const clearFilters = () => {
    onFiltersChange({
      categoria_id: null,
      organizacion_id: null,
      cargo_id: null,
      nivel: null,
      relacion: null,
    });
  };

  return (
    <Card className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <h3 className="text-sm font-semibold">Filtros de Población</h3>
        </div>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="h-7 text-xs"
          >
            <X className="w-3 h-3 mr-1" />
            Limpiar
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
        {/* Categoría */}
        <div className="space-y-2">
          <Label htmlFor="filter-categoria" className="text-xs">
            Categoría
          </Label>
          <Select
            value={filters.categoria_id?.toString() || "all"}
            onValueChange={(value) => handleFilterChange("categoria_id", value)}
          >
            <SelectTrigger id="filter-categoria" className="h-9 text-xs">
              <SelectValue placeholder="Todas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              {categorias.map((cat) => (
                <SelectItem key={cat.id} value={cat.id.toString()}>
                  {cat.nombre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Organización */}
        <div className="space-y-2">
          <Label htmlFor="filter-organizacion" className="text-xs">
            Organización
          </Label>
          <Select
            value={filters.organizacion_id?.toString() || "all"}
            onValueChange={(value) => handleFilterChange("organizacion_id", value)}
          >
            <SelectTrigger id="filter-organizacion" className="h-9 text-xs">
              <SelectValue placeholder="Todas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              {organizaciones.map((org) => (
                <SelectItem key={org.id} value={org.id.toString()}>
                  {org.nombre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Cargo */}
        <div className="space-y-2">
          <Label htmlFor="filter-cargo" className="text-xs">
            Cargo
          </Label>
          <Select
            value={filters.cargo_id?.toString() || "all"}
            onValueChange={(value) => handleFilterChange("cargo_id", value)}
          >
            <SelectTrigger id="filter-cargo" className="h-9 text-xs">
              <SelectValue placeholder="Todos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              {cargos.map((cargo) => (
                <SelectItem key={cargo.id} value={cargo.id.toString()}>
                  {cargo.nombre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Nivel */}
        <div className="space-y-2">
          <Label htmlFor="filter-nivel" className="text-xs">
            Nivel
          </Label>
          <Select
            value={filters.nivel || "all"}
            onValueChange={(value) => handleFilterChange("nivel", value)}
          >
            <SelectTrigger id="filter-nivel" className="h-9 text-xs">
              <SelectValue placeholder="Todos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="PRIMER_NIVEL">Primer Nivel</SelectItem>
              <SelectItem value="SEGUNDO_NIVEL">Segundo Nivel</SelectItem>
              <SelectItem value="TERCER_NIVEL">Tercer Nivel</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Relación */}
        <div className="space-y-2">
          <Label htmlFor="filter-relacion" className="text-xs">
            Relación
          </Label>
          <Select
            value={filters.relacion || "all"}
            onValueChange={(value) => handleFilterChange("relacion", value)}
          >
            <SelectTrigger id="filter-relacion" className="h-9 text-xs">
              <SelectValue placeholder="Todas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              <SelectItem value="A_FAVOR">A Favor</SelectItem>
              <SelectItem value="INDIFERENTE">Indiferente</SelectItem>
              <SelectItem value="EN_CONTRA">En Contra</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Color Filter Selector */}
      <div className="pt-3 border-t">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Label htmlFor="color-filter" className="text-xs font-semibold">
              Color de Visualización
            </Label>
            <span className="text-xs text-muted-foreground">
              (Define el color de las bullets)
            </span>
          </div>
        </div>
        <div className="mt-2">
          <Select value={colorFilter} onValueChange={onColorFilterChange}>
            <SelectTrigger id="color-filter" className="h-9 text-xs w-full md:w-64">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="nivel_poder">Nivel de Poder</SelectItem>
              <SelectItem value="relacion">Relación</SelectItem>
              <SelectItem value="categoria">Categoría</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </Card>
  );
};

