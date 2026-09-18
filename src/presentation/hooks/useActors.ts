/**
 * Presentation Hook: useActors
 * React Query hook for actor data
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAllActors, createActor, updateActor } from "@/application/use-cases/actor";
import { CreateActorDto, UpdateActorDto, Actor } from "@/domain/entities/Actor";
import { ActorsFilterParams, PaginatedActorsResult } from "@/domain/repositories/ActorRepository";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/presentation/context/AuthContext";
import { useCategorias } from "./useCategorias";
import { useOrganizaciones } from "./useOrganizaciones";
import { useCargos } from "./useCargos";
import { useMemo } from "react";

interface UseActorsOptions {
  filters?: ActorsFilterParams;
  enabled?: boolean;
}

export const useActors = (options?: UseActorsOptions) => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { categorias } = useCategorias();
  const { organizaciones } = useOrganizaciones();
  const { cargos } = useCargos();

  const filters = options?.filters || {};
  const enabled = options?.enabled !== false;

  // Use paginated endpoint if filters are provided, otherwise use legacy endpoint
  const usePaginated = filters.page !== undefined || filters.page_size !== undefined || 
                       filters.nombre || filters.categoria_id !== undefined || 
                       filters.organizacion_id !== undefined || filters.cargo_id !== undefined ||
                       filters.nivel_poder || filters.nivel || filters.relacion ||
                       filters.celular || filters.correo;

  const { data: paginatedData, isLoading: isLoadingPaginated, error: errorPaginated } = useQuery({
    queryKey: ["actors", "paginated", filters],
    queryFn: () => getAllActors.executeWithFilters(filters),
    enabled: enabled && usePaginated as boolean,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const { data: actorsRaw = [], isLoading: isLoadingLegacy, error: errorLegacy } = useQuery({
    queryKey: ["actors"],
    queryFn: () => getAllActors.execute(),
    enabled: enabled && !usePaginated as boolean,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const isLoading = usePaginated ? isLoadingPaginated : isLoadingLegacy;
  const error = usePaginated ? errorPaginated : errorLegacy;
  const actorsData = usePaginated ? (paginatedData as PaginatedActorsResult)?.items || [] : actorsRaw;

  // Enrich actors with catalog names
  const actors = useMemo(() => {
    return actorsData.map((actor: Actor) => {
      // Get categoria_id from actor (stored by mapper) or try to match by current categoria value
      const categoriaId = (actor as any).categoria_id || 
        categorias.find((c) => c.nombre === actor.categoria || c.id === actor.categoria)?.id;
      
      // Find categoria name by ID
      const categoria = categoriaId 
        ? categorias.find((c) => c.id === categoriaId)
        : null;
      
      // Get organizacion_id from actor (stored by mapper) or try to match by current organizacion value
      const organizacionId = (actor as any).organizacion_id || 
        organizaciones.find((o) => o.nombre === actor.organizacion || o.id === actor.organizacion)?.id;
      
      // Find organizacion name by ID
      const organizacion = organizacionId
        ? organizaciones.find((o) => o.id === organizacionId)
        : null;

      // Get cargo_id from actor (stored by mapper) or try to match by current cargo value
      const cargoId = (actor as any).cargo_id || 
        cargos.find((c) => c.nombre === actor.cargo || c.id === actor.cargo)?.id;
      
      // Find cargo name by ID
      const cargo = cargoId
        ? cargos.find((c) => c.id === cargoId)
        : null;

      return {
        ...actor,
        categoria: categoria?.nombre || actor.categoria,
        organizacion: organizacion?.nombre || actor.organizacion,
        cargo: cargo?.nombre || actor.cargo,
      } as Actor;
    });
  }, [actorsData, categorias, organizaciones, cargos]);

  // Return pagination info if using paginated endpoint
  const pagination = usePaginated && paginatedData ? {
    total: paginatedData.total,
    page: paginatedData.page,
    page_size: paginatedData.page_size,
    total_pages: paginatedData.total_pages,
  } : undefined;

  const createMutation = useMutation({
    mutationFn: (data: CreateActorDto) => {
      if (!user) {
        throw new Error("Usuario no autenticado");
      }
      return createActor.execute(data, user.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["actors"] });
      queryClient.invalidateQueries({ queryKey: ["actors", "paginated"] });
      toast({
        title: "Actor creado",
        description: "El actor ha sido creado exitosamente",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "No se pudo crear el actor",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: UpdateActorDto) => {
      if (!user) {
        throw new Error("Usuario no autenticado");
      }
      return updateActor.execute(data, user.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["actors"] });
      queryClient.invalidateQueries({ queryKey: ["actors", "paginated"] });
      toast({
        title: "Actor actualizado",
        description: "El actor ha sido actualizado exitosamente",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "No se pudo actualizar el actor",
        variant: "destructive",
      });
    },
  });

  return {
    actors,
    isLoading,
    error,
    pagination,
    createActor: createMutation.mutate,
    updateActor: updateMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
  };
};
