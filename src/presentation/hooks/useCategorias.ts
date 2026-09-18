/**
 * Presentation Hook: useCategorias
 * React Query hook for categoria data
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  getAllCategorias, 
  createCategoria, 
  updateCategoria,
  deleteCategoria 
} from "@/application/use-cases/catalog";
import { CreateCatalogDto, UpdateCatalogDto } from "@/domain/entities/Catalog";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/presentation/context/AuthContext";

export const useCategorias = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const { data: categorias = [], isLoading, error } = useQuery({
    queryKey: ["categorias"],
    queryFn: () => getAllCategorias.execute(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateCatalogDto) => {
      if (!user) {
        throw new Error("Usuario no autenticado");
      }
      return createCategoria.execute(data, user.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categorias"] });
      toast({
        title: "Categoría creada",
        description: "La categoría ha sido creada exitosamente",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "No se pudo crear la categoría",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: UpdateCatalogDto) => {
      if (!user) {
        throw new Error("Usuario no autenticado");
      }
      return updateCategoria.execute(data, user.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categorias"] });
      toast({
        title: "Categoría actualizada",
        description: "La categoría ha sido actualizada exitosamente",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "No se pudo actualizar la categoría",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteCategoria.execute(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categorias"] });
      toast({
        title: "Categoría eliminada",
        description: "La categoría ha sido eliminada exitosamente",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "No se pudo eliminar la categoría",
        variant: "destructive",
      });
    },
  });

  return {
    categorias,
    isLoading,
    error,
    createCategoria: createMutation.mutate,
    updateCategoria: updateMutation.mutate,
    deleteCategoria: deleteMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
};

