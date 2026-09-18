/**
 * Page: Actors
 * List and manage actors
 */

import { useState, useMemo, useEffect, memo, useCallback } from "react";
import { useActors } from "@/presentation/hooks/useActors";
import { ActorTable } from "@/presentation/components/actors/ActorTable";
import { ActorFormDialog } from "@/presentation/components/actors/ActorFormDialog";
import { Actor, CreateActorDto, UpdateActorDto } from "@/domain/entities/Actor";
import { ActorsFilterParams } from "@/domain/repositories/ActorRepository";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Search } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/pagination";

// Memoizar el header para evitar re-renders innecesarios
const ActorsHeader = memo(({ 
  onCreateClick 
}: { 
  onCreateClick: () => void; 
}) => {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Actores</h1>
        <p className="text-muted-foreground mt-1">
          Gestiona la información de todos los actores
        </p>
      </div>
      <div className="flex gap-2">
        <Button onClick={onCreateClick}>
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Actor
        </Button>
      </div>
    </div>
  );
});
ActorsHeader.displayName = "ActorsHeader";

// Memoizar el filtro de búsqueda
const SearchFilter = memo(({ 
  searchQuery, 
  onSearchChange 
}: { 
  searchQuery: string; 
  onSearchChange: (value: string) => void; 
}) => {
  return (
    <Card className="p-4">
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre, organización, cargo o correo..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>
    </Card>
  );
});
SearchFilter.displayName = "SearchFilter";

// Memoizar el contador de resultados
const ResultsCount = memo(({ 
  pagination, 
  actorsCount 
}: { 
  pagination?: { page: number; page_size: number; total: number } | null; 
  actorsCount: number; 
}) => {
  return (
    <div className="flex items-center justify-between">
      <p className="text-sm text-muted-foreground">
        {pagination ? (
          <>
            Mostrando {(pagination.page - 1) * pagination.page_size + 1} -{" "}
            {Math.min(pagination.page * pagination.page_size, pagination.total)} de{" "}
            {pagination.total} actores
          </>
        ) : (
          <>Mostrando {actorsCount} actores</>
        )}
      </p>
    </div>
  );
});
ResultsCount.displayName = "ResultsCount";

// Memoizar la paginación
const ActorsPagination = memo(({ 
  pagination, 
  currentPage, 
  onPageChange 
}: { 
  pagination: { total_pages: number; page: number; page_size: number; total: number }; 
  currentPage: number; 
  onPageChange: (page: number) => void; 
}) => {
  if (pagination.total_pages <= 1) return null;

  return (
    <div className="flex justify-center">
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              href="#"
              onClick={(e) => {
                e.preventDefault();
                if (currentPage > 1) onPageChange(currentPage - 1);
              }}
              className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
            />
          </PaginationItem>
          
          {Array.from({ length: pagination.total_pages }, (_, i) => i + 1).map((pageNum) => {
            if (
              pageNum === 1 ||
              pageNum === pagination.total_pages ||
              (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
            ) {
              return (
                <PaginationItem key={pageNum}>
                  <PaginationLink
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      onPageChange(pageNum);
                    }}
                    isActive={pageNum === currentPage}
                  >
                    {pageNum}
                  </PaginationLink>
                </PaginationItem>
              );
            } else if (pageNum === currentPage - 2 || pageNum === currentPage + 2) {
              return (
                <PaginationItem key={pageNum}>
                  <PaginationEllipsis />
                </PaginationItem>
              );
            }
            return null;
          })}
          
          <PaginationItem>
            <PaginationNext
              href="#"
              onClick={(e) => {
                e.preventDefault();
                if (currentPage < pagination.total_pages) onPageChange(currentPage + 1);
              }}
              className={currentPage === pagination.total_pages ? "pointer-events-none opacity-50" : ""}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
});
ActorsPagination.displayName = "ActorsPagination";

const Actors = () => {
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [selectedActor, setSelectedActor] = useState<Actor | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [actorToEdit, setActorToEdit] = useState<Actor | null>(null);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
      setPage(1); // Reset to first page when search changes
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Build filters
  const filters: ActorsFilterParams = useMemo(() => {
    const filterParams: ActorsFilterParams = {
      page,
      page_size: pageSize,
    };

    if (debouncedSearchQuery.trim()) {
      // Use nombre filter for general search (API supports partial search)
      filterParams.nombre = debouncedSearchQuery.trim();
    }

    return filterParams;
  }, [page, pageSize, debouncedSearchQuery]);

  const { actors, isLoading, pagination, createActor, updateActor, isCreating, isUpdating } = useActors({
    filters,
  });

  // Memoizar callbacks para evitar re-renders innecesarios
  const handleViewActor = useCallback((actor: Actor) => {
    setSelectedActor(actor);
  }, []);

  const handleEditActor = useCallback((actor: Actor) => {
    setActorToEdit(actor);
  }, []);

  const handleCreateActor = useCallback((data: CreateActorDto) => {
    createActor(data);
    setShowCreateDialog(false);
  }, [createActor]);

  const handleUpdateActor = useCallback((data: CreateActorDto) => {
    if (actorToEdit) {
      const updateData: UpdateActorDto = {
        id: actorToEdit.id,
        ...data,
      };
      updateActor(updateData);
      setActorToEdit(null);
    }
  }, [actorToEdit, updateActor]);

  const handlePageChange = useCallback((newPage: number) => {
    setPage(newPage);
  }, []);

  const handleSearchChange = useCallback((value: string) => {
    setSearchQuery(value);
  }, []);

  const handleCreateClick = useCallback(() => {
    setShowCreateDialog(true);
  }, []);

  return (
    <div className="space-y-6">
      {/* Header - Memoizado */}
      <ActorsHeader 
        onCreateClick={handleCreateClick}
      />

      {/* Filters - Memoizado */}
      <SearchFilter 
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
      />

      {/* Results count - Memoizado */}
      <ResultsCount 
        pagination={pagination || undefined}
        actorsCount={actors.length}
      />

      {/* Table - Solo muestra skeleton cuando está cargando, no reemplaza toda la página */}
      {isLoading ? (
        <div className="rounded-lg border border-border overflow-hidden">
          <div className="p-4 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </div>
      ) : (
        <ActorTable 
          actors={actors} 
          onViewActor={handleViewActor}
          onEditActor={handleEditActor}
        />
      )}

      {/* Pagination - Memoizado */}
      {pagination && (
        <ActorsPagination
          pagination={pagination}
          currentPage={page}
          onPageChange={handlePageChange}
        />
      )}

      {/* Create Actor Dialog */}
      <ActorFormDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onSubmit={handleCreateActor}
        isLoading={isCreating}
      />

      {/* Edit Actor Dialog */}
      <ActorFormDialog
        open={!!actorToEdit}
        onOpenChange={(open) => !open && setActorToEdit(null)}
        onSubmit={handleUpdateActor}
        isLoading={isUpdating}
        actor={actorToEdit}
      />

      {/* Actor Detail Dialog */}
      <Dialog open={!!selectedActor} onOpenChange={() => setSelectedActor(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalle del Actor</DialogTitle>
          </DialogHeader>
          {selectedActor && (
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-semibold">{selectedActor.nombre}</h3>
                <p className="text-muted-foreground">{selectedActor.cargo || ""}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Organización</p>
                  <p className="text-sm">{selectedActor.organizacion || ""}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Categoría</p>
                  <Badge>{selectedActor.categoria || ""}</Badge>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Correo</p>
                  <a href={`mailto:${selectedActor.correo}`} className="text-sm text-primary hover:underline">
                    {selectedActor.correo || ""}
                  </a>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Celular</p>
                  <a href={`tel:${selectedActor.celular || ""}`} className="text-sm text-primary hover:underline">
                    {selectedActor.celular || ""}
                  </a>
                </div>
                {selectedActor.relacion && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Relación</p>
                    <Badge variant="secondary">
                      {selectedActor.relacion?.replace("_", " ") || ""}
                    </Badge>
                  </div>
                )}
                {selectedActor.nivel_poder && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Nivel de Poder</p>
                    <Badge variant="outline">
                      {selectedActor.nivel_poder?.replace("_", " ") || ""}
                    </Badge>
                  </div>
                )}
              </div>

              {selectedActor.observaciones && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Observaciones</p>
                  <p className="text-sm mt-1">{selectedActor.observaciones || ""}</p>
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

export default Actors;
