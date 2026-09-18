/**
 * Presentation Component: Catalog Management Dialog
 * Generic dialog for managing catalog items (CRUD operations)
 */

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Loader2, Plus, Pencil, Trash2 } from "lucide-react";
import {
  CreateCatalogDto,
  Distrito,
  Municipio,
  Organization,
  TipoOrganizacion,
  UpdateCatalogDto,
} from "@/domain/entities/Catalog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const catalogSchema = z.object({
  nombre: z.string().min(1, "El nombre es requerido").max(100),
  distritoId: z.string().optional(),
  departamentoId: z.string().optional(),
  municipio_id: z.string().optional(),
  organizacion_id: z.string().optional(),
  tipo_organizacion_id: z.string().optional(),
});

type CatalogFormData = z.infer<typeof catalogSchema>;

interface CatalogItem {
  id: string;
  nombre: string;
  distritoId?: string;
  departamentoId?: string;
  codigo?: string;
  municipio_id?: string;
  organizacion_id?: string;
  tipo_organizacion_id?: string;
  tipo?: string;
}

interface CatalogManagementDialogProps<T extends CatalogItem> {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  items: T[];
  isLoading: boolean;
  onCreate: (data: CreateCatalogDto) => void;
  onUpdate: (data: UpdateCatalogDto) => void;
  onDelete?: (id: string) => void;
  isCreating?: boolean;
  isUpdating?: boolean;
  isDeleting?: boolean;
  hasDepartamento?: boolean;
  municipios?: Municipio[];
  distritos?: Distrito[];
  organizaciones?: Organization[];
  tiposOrganizaciones?: TipoOrganizacion[];
}

export function CatalogManagementDialog<T extends CatalogItem>({
  open,
  onOpenChange,
  title,
  items,
  isLoading,
  onCreate,
  onUpdate,
  onDelete,
  isCreating,
  isUpdating,
  isDeleting,
  distritos,
  municipios,
  organizaciones,
  hasDepartamento,
  tiposOrganizaciones,
}: CatalogManagementDialogProps<T>) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const form = useForm<CatalogFormData>({
    resolver: zodResolver(catalogSchema),
    defaultValues: {
      nombre: "",
      distritoId: undefined,
      departamentoId: undefined,
      municipio_id: undefined,
      organizacion_id: undefined,
      tipo_organizacion_id: undefined,
    },
  });

  const handleSubmit = (data: CatalogFormData) => {
    if (editingId) {
      // Update mode
      onUpdate({ id: editingId, ...data });
      setEditingId(null);
    } else {
      // Create mode
      onCreate(data as CreateCatalogDto);
    }
    form.reset({
      nombre: "",
      distritoId: undefined,
      departamentoId: undefined,
      municipio_id: undefined,
      organizacion_id: undefined,
      tipo_organizacion_id: undefined,
    });
  };

  const handleEdit = (item: T) => {
    setEditingId(item.id);
    // Map fields correctly based on what the item has
    form.reset({ 
      nombre: item.nombre, 
      distritoId: item.distritoId || item.departamentoId, // For municipios, distritoId comes from departamentoId (which is the distrito_id)
      departamentoId: item.codigo || item.departamentoId, // For municipios, departamentoId in form is the string value (codigo), not the ID
      municipio_id: item.municipio_id, 
      organizacion_id: item.organizacion_id, 
      tipo_organizacion_id: item.tipo_organizacion_id || item.tipo // For organizaciones, tipo_organizacion_id comes from tipo
    });
  };

  const handleCancel = () => {
    setEditingId(null);
    form.reset();
  };

  const handleDeleteClick = (id: string) => {
    setDeletingId(id);
    setShowDeleteDialog(true);
  };

  const handleDeleteConfirm = () => {
    if (deletingId && onDelete) {
      onDelete(deletingId);
      setShowDeleteDialog(false);
      setDeletingId(null);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-3xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Create/Edit Form */}
            <div className="border rounded-lg p-4 bg-muted/30">
              <h3 className="font-medium mb-3">
                {editingId ? "Editar Elemento" : "Agregar Nuevo"}
              </h3>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(handleSubmit)}
                  className="flex gap-2"
                >
                  <FormField
                    control={form.control}
                    name="nombre"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormControl>
                          <Input placeholder="Nombre" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {distritos && (
                    <FormField
                      control={form.control}
                      name="distritoId"
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormControl>
                            <Select
                              onValueChange={field.onChange}
                              value={field.value}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Distrito" />
                              </SelectTrigger>
                              <SelectContent>
                                {distritos?.map((distrito) => (
                                  <SelectItem
                                    key={distrito.id}
                                    value={distrito.id}
                                  >
                                    {distrito.nombre}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                  {hasDepartamento && (
                    <FormField
                      control={form.control}
                      name="departamentoId"
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormControl>
                            <Input placeholder="Departamento" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                  {municipios && (
                    <FormField
                      control={form.control}
                      name="municipio_id"
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormControl>
                            <Select
                              onValueChange={field.onChange}
                              value={field.value}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Municipio" />
                              </SelectTrigger>
                              <SelectContent>
                                {municipios?.map((municipio) => (
                                  <SelectItem
                                    key={municipio.id}
                                    value={municipio.id}
                                  >
                                    {municipio.nombre}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                  {organizaciones && (
                    <FormField
                      control={form.control}
                      name="organizacion_id"
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormControl>
                            <Select
                              onValueChange={field.onChange}
                              value={field.value}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Organización" />
                              </SelectTrigger>
                              <SelectContent>
                                {organizaciones?.map((organizacion) => (
                                  <SelectItem
                                    key={organizacion.id}
                                    value={organizacion.id}
                                  >
                                    {organizacion.nombre}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                  {tiposOrganizaciones && (
                    <FormField
                      control={form.control}
                      name="tipo_organizacion_id"
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormControl>
                            <Select
                              onValueChange={field.onChange}
                              value={field.value}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Tipo de Organización" />
                              </SelectTrigger>
                              <SelectContent>
                                {tiposOrganizaciones?.map(
                                  (tipoOrganizacion) => (
                                    <SelectItem
                                      key={tipoOrganizacion.id}
                                      value={tipoOrganizacion.id}
                                    >
                                      {tipoOrganizacion.nombre}
                                    </SelectItem>
                                  )
                                )}
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  {editingId ? (
                    <>
                      <Button type="submit" disabled={isUpdating}>
                        {isUpdating && (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        )}
                        Guardar
                      </Button>
                      <Button 
                        type="button" 
                        variant="outline"
                        onClick={handleCancel}
                        disabled={isUpdating}
                      >
                        Cancelar
                      </Button>
                    </>
                  ) : (
                    <Button type="submit" disabled={isCreating}>
                      {isCreating && (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      )}
                      <Plus className="w-4 h-4 mr-2" />
                      Agregar
                    </Button>
                  )}
                </form>
              </Form>
            </div>

            {/* Items Table */}
            <div className={`border rounded-lg overflow-hidden ${editingId ? 'opacity-50 pointer-events-none' : ''}`}>
              <div className="max-h-[400px] overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nombre</TableHead>
                      {distritos && <TableHead>Distrito</TableHead>}
                      {hasDepartamento && <TableHead>Departamento</TableHead>}
                      {municipios && <TableHead>Municipio</TableHead>}
                      {organizaciones && <TableHead>Organización</TableHead>}
                      {tiposOrganizaciones && <TableHead>Tipo de Organización</TableHead>}
                      <TableHead className="w-[100px] text-right">
                        Acciones
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      <TableRow>
                        <TableCell colSpan={2} className="text-center py-8">
                          <Loader2 className="w-6 h-6 animate-spin mx-auto" />
                        </TableCell>
                      </TableRow>
                    ) : items.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={2}
                          className="text-center py-8 text-muted-foreground"
                        >
                          No hay elementos
                        </TableCell>
                      </TableRow>
                    ) : (
                      items.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>
                            {item.nombre}
                          </TableCell>
                          {distritos && (
                            <TableCell>
                              {distritos.find(d => d.id === item.distritoId)?.nombre || "-"}
                            </TableCell>
                          )}
                          {hasDepartamento && (
                            <TableCell>
                              {(item as any).codigo || item.departamentoId || "-"}
                            </TableCell>
                          )}
                          {municipios && (
                            <TableCell>
                              {municipios.find(m => m.id === item.municipio_id)?.nombre || "-"}
                            </TableCell>
                          )}
                          {organizaciones && (
                            <TableCell>
                              {organizaciones.find(o => o.id === item.organizacion_id)?.nombre || "-"}
                            </TableCell>
                          )}
                          {tiposOrganizaciones && (
                            <TableCell>
                              {tiposOrganizaciones.find(t => t.id === item.tipo_organizacion_id)?.nombre || "-"}
                            </TableCell>
                          )}
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                size="sm"
                                variant="ghost"
                                disabled={isUpdating || !!editingId}
                                onClick={() => handleEdit(item)}
                              >
                                <Pencil className="w-4 h-4" />
                              </Button>
                              {onDelete && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  disabled={!!editingId}
                                  onClick={() => handleDeleteClick(item.id)}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>

            <div className="flex justify-between items-center text-sm text-muted-foreground">
              <span>Total: {items.length} elementos</span>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar elemento?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. El elemento será eliminado
              permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isDeleting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
