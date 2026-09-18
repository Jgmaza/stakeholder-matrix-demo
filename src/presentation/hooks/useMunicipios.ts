/**
 * Presentation Hook: useMunicipios
 * React Query hook for municipio data
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  getAllMunicipios, 
  createMunicipio, 
  updateMunicipio,
  deleteMunicipio 
} from "@/application/use-cases/catalog";
import { CreateCatalogDto, UpdateCatalogDto } from "@/domain/entities/Catalog";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/presentation/context/AuthContext";

export const useMunicipios = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const { data: municipios = [], isLoading, error } = useQuery({
    queryKey: ["municipios"],
    queryFn: () => getAllMunicipios.execute(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateCatalogDto) => {
      if (!user) {
        throw new Error("Usuario no autenticado");
      }
      return createMunicipio.execute(data, user.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["municipios"] });
      toast({
        title: "Municipio creado",
        description: "El municipio ha sido creado exitosamente",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "No se pudo crear el municipio",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: UpdateCatalogDto) => {
      if (!user) {
        throw new Error("Usuario no autenticado");
      }
      return updateMunicipio.execute(data, user.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["municipios"] });
      toast({
        title: "Municipio actualizado",
        description: "El municipio ha sido actualizado exitosamente",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "No se pudo actualizar el municipio",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteMunicipio.execute(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["municipios"] });
      toast({
        title: "Municipio eliminado",
        description: "El municipio ha sido eliminado exitosamente",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "No se pudo eliminar el municipio",
        variant: "destructive",
      });
    },
  });

  return {
    municipios,
    isLoading,
    error,
    createMunicipio: createMutation.mutate,
    updateMunicipio: updateMutation.mutate,
    deleteMunicipio: deleteMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
};

