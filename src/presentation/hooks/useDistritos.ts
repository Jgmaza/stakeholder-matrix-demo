/**
 * Presentation Hook: useDistritos
 * React Query hook for distrito data
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  getAllDistritos, 
  createDistrito, 
  updateDistrito,
  deleteDistrito 
} from "@/application/use-cases/catalog";
import { CreateCatalogDto, UpdateCatalogDto } from "@/domain/entities/Catalog";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/presentation/context/AuthContext";

export const useDistritos = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const { data: distritos = [], isLoading, error } = useQuery({
    queryKey: ["distritos"],
    queryFn: () => getAllDistritos.execute(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateCatalogDto) => {
      if (!user) {
        throw new Error("Usuario no autenticado");
      }
      return createDistrito.execute(data, user.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["distritos"] });
      toast({
        title: "Distrito creado",
        description: "El distrito ha sido creado exitosamente",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "No se pudo crear el distrito",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: UpdateCatalogDto) => {
      if (!user) {
        throw new Error("Usuario no autenticado");
      }
      return updateDistrito.execute(data, user.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["distritos"] });
      toast({
        title: "Distrito actualizado",
        description: "El distrito ha sido actualizado exitosamente",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "No se pudo actualizar el distrito",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteDistrito.execute(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["distritos"] });
      toast({
        title: "Distrito eliminado",
        description: "El distrito ha sido eliminado exitosamente",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "No se pudo eliminar el distrito",
        variant: "destructive",
      });
    },
  });

  return {
    distritos,
    isLoading,
    error,
    createDistrito: createMutation.mutate,
    updateDistrito: updateMutation.mutate,
    deleteDistrito: deleteMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
};

