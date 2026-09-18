/**
 * Presentation Hook: useTiposOrganizaciones
 * React Query hook for tipo organizacion data
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  getAllTiposOrganizaciones, 
  createTipoOrganizacion, 
  updateTipoOrganizacion,
  deleteTipoOrganizacion 
} from "@/application/use-cases/catalog";
import { CreateCatalogDto, UpdateCatalogDto } from "@/domain/entities/Catalog";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/presentation/context/AuthContext";

export const useTiposOrganizaciones = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const { data: tiposOrganizaciones = [], isLoading, error } = useQuery({
    queryKey: ["tiposOrganizaciones"],
    queryFn: () => getAllTiposOrganizaciones.execute(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateCatalogDto) => {
      if (!user) {
        throw new Error("Usuario no autenticado");
      }
      return createTipoOrganizacion.execute(data, user.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tiposOrganizaciones"] });
      toast({
        title: "Tipo de organización creado",
        description: "El tipo de organización ha sido creado exitosamente",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "No se pudo crear el tipo de organización",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: UpdateCatalogDto) => {
      if (!user) {
        throw new Error("Usuario no autenticado");
      }
      return updateTipoOrganizacion.execute(data, user.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tiposOrganizaciones"] });
      toast({
        title: "Tipo de organización actualizado",
        description: "El tipo de organización ha sido actualizado exitosamente",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "No se pudo actualizar el tipo de organización",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteTipoOrganizacion.execute(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tiposOrganizaciones"] });
      toast({
        title: "Tipo de organización eliminado",
        description: "El tipo de organización ha sido eliminado exitosamente",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "No se pudo eliminar el tipo de organización",
        variant: "destructive",
      });
    },
  });

  return {
    tiposOrganizaciones,
    isLoading,
    error,
    createTipoOrganizacion: createMutation.mutate,
    updateTipoOrganizacion: updateMutation.mutate,
    deleteTipoOrganizacion: deleteMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
};

