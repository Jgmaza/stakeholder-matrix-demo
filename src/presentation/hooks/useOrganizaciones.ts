/**
 * Presentation Hook: useOrganizaciones
 * React Query hook for organizacion data
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  getAllOrganizaciones, 
  createOrganizacion, 
  updateOrganizacion,
  deleteOrganizacion 
} from "@/application/use-cases/catalog";
import { CreateCatalogDto, UpdateCatalogDto } from "@/domain/entities/Catalog";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/presentation/context/AuthContext";

export const useOrganizaciones = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const { data: organizaciones = [], isLoading, error } = useQuery({
    queryKey: ["organizaciones"],
    queryFn: () => getAllOrganizaciones.execute(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateCatalogDto) => {
      if (!user) {
        throw new Error("Usuario no autenticado");
      }
      return createOrganizacion.execute(data, user.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["organizaciones"] });
      toast({
        title: "Organización creada",
        description: "La organización ha sido creada exitosamente",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "No se pudo crear la organización",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: UpdateCatalogDto) => {
      if (!user) {
        throw new Error("Usuario no autenticado");
      }
      return updateOrganizacion.execute(data, user.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["organizaciones"] });
      toast({
        title: "Organización actualizada",
        description: "La organización ha sido actualizada exitosamente",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "No se pudo actualizar la organización",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteOrganizacion.execute(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["organizaciones"] });
      toast({
        title: "Organización eliminada",
        description: "La organización ha sido eliminada exitosamente",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "No se pudo eliminar la organización",
        variant: "destructive",
      });
    },
  });

  return {
    organizaciones,
    isLoading,
    error,
    createOrganizacion: createMutation.mutate,
    updateOrganizacion: updateMutation.mutate,
    deleteOrganizacion: deleteMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
};

