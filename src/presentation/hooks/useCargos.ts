/**
 * Presentation Hook: useCargos
 * React Query hook for cargo data
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getAllCargos,
  createCargo,
  updateCargo,
  deleteCargo
} from "@/application/use-cases/catalog";
import { CreateCatalogDto, UpdateCatalogDto } from "@/domain/entities/Catalog";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/presentation/context/AuthContext";

export const useCargos = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const { data: cargos = [], isLoading, error } = useQuery({
    queryKey: ["cargos"],
    queryFn: () => getAllCargos.execute(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateCatalogDto) => {
      if (!user) {
        throw new Error("Usuario no autenticado");
      }
      return createCargo.execute(data, user.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cargos"] });
      toast({
        title: "Cargo creado",
        description: "El cargo ha sido creado exitosamente",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "No se pudo crear el cargo",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: UpdateCatalogDto) => {
      if (!user) {
        throw new Error("Usuario no autenticado");
      }
      return updateCargo.execute(data, user.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cargos"] });
      toast({
        title: "Cargo actualizado",
        description: "El cargo ha sido actualizado exitosamente",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "No se pudo actualizar el cargo",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteCargo.execute(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cargos"] });
      toast({
        title: "Cargo eliminado",
        description: "El cargo ha sido eliminado exitosamente",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "No se pudo eliminar el cargo",
        variant: "destructive",
      });
    },
  });

  return {
    cargos,
    isLoading,
    error,
    createCargo: createMutation.mutate,
    updateCargo: updateMutation.mutate,
    deleteCargo: deleteMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
};

