/**
 * Page: Catalogos
 * Manage organizational catalogs
 */

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Building2, MapPin, Map, Tag, FolderTree, Briefcase } from "lucide-react";
import { useDistritos } from "@/presentation/hooks/useDistritos";
import { useMunicipios } from "@/presentation/hooks/useMunicipios";
import { useOrganizaciones } from "@/presentation/hooks/useOrganizaciones";
import { useTiposOrganizaciones } from "@/presentation/hooks/useTipoOrganizaciones";
import { useCategorias } from "@/presentation/hooks/useCategorias";
import { useCargos } from "@/presentation/hooks/useCargos";
import { CatalogManagementDialog } from "@/presentation/components/catalogs/CatalogManagementDialog";

const Catalogos = () => {
  const [activeDialog, setActiveDialog] = useState<
    "organizaciones" | "distritos" | "municipios" | "tiposOrganizaciones" | "categorias" | "cargos" | null
  >(null);

  const {
    distritos,
    isLoading: isLoadingDistritos,
    createDistrito,
    updateDistrito,
    deleteDistrito,
    isCreating: isCreatingDistrito,
    isUpdating: isUpdatingDistrito,
    isDeleting: isDeletingDistrito,
  } = useDistritos();

  const {
    municipios,
    isLoading: isLoadingMunicipios,
    createMunicipio,
    updateMunicipio,
    deleteMunicipio,
    isCreating: isCreatingMunicipio,
    isUpdating: isUpdatingMunicipio,
    isDeleting: isDeletingMunicipio,
  } = useMunicipios();

  const {
    organizaciones,
    isLoading: isLoadingOrganizaciones,
    createOrganizacion,
    updateOrganizacion,
    deleteOrganizacion,
    isCreating: isCreatingOrganizacion,
    isUpdating: isUpdatingOrganizacion,
    isDeleting: isDeletingOrganizacion,
  } = useOrganizaciones();

  const {
    tiposOrganizaciones,
    isLoading: isLoadingTiposOrganizaciones,
    createTipoOrganizacion,
    updateTipoOrganizacion,
    deleteTipoOrganizacion,
    isCreating: isCreatingTipoOrganizacion,
    isUpdating: isUpdatingTipoOrganizacion,
    isDeleting: isDeletingTipoOrganizacion,
  } = useTiposOrganizaciones();

  const {
    categorias,
    isLoading: isLoadingCategorias,
    createCategoria,
    updateCategoria,
    deleteCategoria,
    isCreating: isCreatingCategoria,
    isUpdating: isUpdatingCategoria,
    isDeleting: isDeletingCategoria,
  } = useCategorias();

  const {
    cargos,
    isLoading: isLoadingCargos,
    createCargo,
    updateCargo,
    deleteCargo,
    isCreating: isCreatingCargo,
    isUpdating: isUpdatingCargo,
    isDeleting: isDeletingCargo,
  } = useCargos();

  const catalogTypes = [
    {
      id: "organizaciones" as const,
      title: "Organizaciones",
      description: "Gestiona empresas, instituciones y entidades",
      icon: Building2,
      count: organizaciones.length,
      isLoading: isLoadingOrganizaciones,
    },
    {
      id: "distritos" as const,
      title: "Distritos",
      description: "Administra los distritos regionales",
      icon: Map,
      count: distritos.length,
      isLoading: isLoadingDistritos,
    },
    {
      id: "municipios" as const,
      title: "Municipios",
      description: "Administra municipios por departamento",
      icon: MapPin,
      count: municipios.length,
      isLoading: isLoadingMunicipios,
    },
    {
      id: "tiposOrganizaciones" as const,
      title: "Tipos de Organización",
      description: "Gestiona los tipos de organizaciones",
      icon: Tag,
      count: tiposOrganizaciones.length,
      isLoading: isLoadingTiposOrganizaciones,
    },
    {
      id: "categorias" as const,
      title: "Categorías",
      description: "Gestiona las categorías de actores",
      icon: FolderTree,
      count: categorias.length,
      isLoading: isLoadingCategorias,
    },
    {
      id: "cargos" as const,
      title: "Cargos",
      description: "Gestiona los cargos de los actores",
      icon: Briefcase,
      count: cargos.length,
      isLoading: isLoadingCargos,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Catálogos</h1>
        <p className="text-muted-foreground mt-1">
          Administra las estructuras organizacionales y geográficas
        </p>
      </div>

      {/* Catalog Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {catalogTypes.map((catalog) => (
          <Card key={catalog.title} className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between mb-4">
                <catalog.icon className="w-8 h-8 text-primary" />
                {catalog.isLoading ? (
                  <Skeleton className="h-8 w-12" />
                ) : (
                  <span className="text-2xl font-bold text-muted-foreground">
                    {catalog.count}
                  </span>
                )}
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {catalog.title}
              </h3>
              <p className="text-sm text-muted-foreground mb-4 flex-1">
                {catalog.description}
              </p>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setActiveDialog(catalog.id)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Gestionar
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Info Card */}
      <Card className="p-6 bg-muted/30">
        <h3 className="font-semibold text-foreground mb-2">
          Acerca de los catálogos
        </h3>
        <p className="text-sm text-muted-foreground">
          Los catálogos son estructuras fundamentales que organizan la información de los actores.
          Mantén estos catálogos actualizados para asegurar la integridad de los datos.
          Si un catálogo está en uso, se te pedirá reasignar los actores antes de eliminarlo.
        </p>
      </Card>

      {/* Catalog Management Dialogs */}
      <CatalogManagementDialog
        open={activeDialog === "organizaciones"}
        onOpenChange={(open) => !open && setActiveDialog(null)}
        title="Gestionar Organizaciones"
        items={organizaciones}
        isLoading={isLoadingOrganizaciones}
        onCreate={createOrganizacion}
        onUpdate={updateOrganizacion}
        onDelete={deleteOrganizacion}
        isCreating={isCreatingOrganizacion}
        isUpdating={isUpdatingOrganizacion}
        isDeleting={isDeletingOrganizacion}
        municipios={municipios}
        tiposOrganizaciones={tiposOrganizaciones}
      />

      <CatalogManagementDialog
        open={activeDialog === "distritos"}
        onOpenChange={(open) => !open && setActiveDialog(null)}
        title="Gestionar Distritos"
        items={distritos}
        isLoading={isLoadingDistritos}
        onCreate={createDistrito}
        onUpdate={updateDistrito}
        onDelete={deleteDistrito}
        isCreating={isCreatingDistrito}
        isUpdating={isUpdatingDistrito}
        isDeleting={isDeletingDistrito}
      />

      <CatalogManagementDialog
        open={activeDialog === "municipios"}
        onOpenChange={(open) => !open && setActiveDialog(null)}
        title="Gestionar Municipios"
        items={municipios}
        isLoading={isLoadingMunicipios}
        onCreate={createMunicipio}
        onUpdate={updateMunicipio}
        onDelete={deleteMunicipio}
        isCreating={isCreatingMunicipio}
        isUpdating={isUpdatingMunicipio}
        isDeleting={isDeletingMunicipio}
        distritos={distritos}
        hasDepartamento
      />
      <CatalogManagementDialog
        open={activeDialog === "tiposOrganizaciones"}
        onOpenChange={(open) => !open && setActiveDialog(null)}
        title="Gestionar Tipos de Organización"
        items={tiposOrganizaciones}
        isLoading={isLoadingTiposOrganizaciones}
        onCreate={createTipoOrganizacion}
        onUpdate={updateTipoOrganizacion}
        onDelete={deleteTipoOrganizacion}
        isCreating={isCreatingTipoOrganizacion}
        isUpdating={isUpdatingTipoOrganizacion}
        isDeleting={isDeletingTipoOrganizacion}
      />
      <CatalogManagementDialog
        open={activeDialog === "categorias"}
        onOpenChange={(open) => !open && setActiveDialog(null)}
        title="Gestionar Categorías"
        items={categorias}
        isLoading={isLoadingCategorias}
        onCreate={createCategoria}
        onUpdate={updateCategoria}
        onDelete={deleteCategoria}
        isCreating={isCreatingCategoria}
        isUpdating={isUpdatingCategoria}
        isDeleting={isDeletingCategoria}
      />
      <CatalogManagementDialog
        open={activeDialog === "cargos"}
        onOpenChange={(open) => !open && setActiveDialog(null)}
        title="Gestionar Cargos"
        items={cargos}
        isLoading={isLoadingCargos}
        onCreate={createCargo}
        onUpdate={updateCargo}
        onDelete={deleteCargo}
        isCreating={isCreatingCargo}
        isUpdating={isUpdatingCargo}
        isDeleting={isDeletingCargo}
      />
    </div>
  );
};

export default Catalogos;
