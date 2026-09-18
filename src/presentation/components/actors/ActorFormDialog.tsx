/**
 * Presentation Component: Actor Form Dialog
 * Dialog for creating and editing actors
 */

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Actor, CreateActorDto } from "@/domain/entities/Actor";
import { Loader2 } from "lucide-react";
import { useCategorias } from "@/presentation/hooks/useCategorias";
import { useOrganizaciones } from "@/presentation/hooks/useOrganizaciones";
import { useCargos } from "@/presentation/hooks/useCargos";

const actorSchema = z.object({
  nombre: z.string().min(1, "El nombre es requerido").max(100),
  categoria_id: z.string().min(1, "La categoría es requerida"),
  organizacion_id: z.string().min(1, "La organización es requerida"),
  cargo_id: z.string().min(1, "El cargo es requerido"),
  celular: z.string().min(1, "El celular es requerido"),
  correo: z.string().email("Correo inválido").min(1, "El correo es requerido"),
  relacion: z.enum(["A_FAVOR", "INDIFERENTE", "EN_CONTRA"]).optional(),
  nivel: z.enum(["PRIMER_NIVEL", "SEGUNDO_NIVEL", "TERCER_NIVEL"]).optional(),
  nivel_poder: z.enum(["ALTO", "MEDIO", "BAJO"]).optional(),
  observaciones: z.string().max(500).optional(),
  funciones: z.string().optional(),
  relacion_predominante: z.string().optional(),
  jerarquizacion_poder: z.string().optional(),
  analisis_actor: z.string().optional(),
  reconocimiento_redes: z.string().optional(),
});

type ActorFormData = z.infer<typeof actorSchema>;

interface ActorFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateActorDto) => void;
  isLoading?: boolean;
  actor?: Actor | null; // Actor to edit, null for create mode
}

export const ActorFormDialog = ({
  open,
  onOpenChange,
  onSubmit,
  isLoading,
  actor,
}: ActorFormDialogProps) => {
  const { categorias, isLoading: isLoadingCategorias } = useCategorias();
  const { organizaciones, isLoading: isLoadingOrganizaciones } =
    useOrganizaciones();
  const { cargos, isLoading: isLoadingCargos } = useCargos();

  const isEditMode = !!actor;

  const form = useForm<ActorFormData>({
    resolver: zodResolver(actorSchema),
    defaultValues: {
      nombre: "",
      categoria_id: "",
      organizacion_id: "",
      cargo_id: "",
      celular: "",
      correo: "",
      nivel: undefined,
      nivel_poder: undefined,
      relacion: undefined,
      observaciones: "",
      funciones: "",
      relacion_predominante: "",
      jerarquizacion_poder: "",
      analisis_actor: "",
      reconocimiento_redes: "",
    },
  });

  // Load actor data when editing
  useEffect(() => {
    if (open && actor) {
      form.reset({
        nombre: actor.nombre || "",
        categoria_id: actor.categoria_id || "",
        organizacion_id: actor.organizacion_id || "",
        cargo_id: actor.cargo_id || "",
        celular: actor.celular || "",
        correo: actor.correo || "",
        nivel_poder: actor.nivel_poder,
        nivel: actor.nivel,
        relacion: actor.relacion,
        observaciones: actor.observaciones || "",
        funciones: actor.funciones || "",
        relacion_predominante: actor.relacion_predominante || "",
        jerarquizacion_poder: actor.jerarquizacion_poder || "",
        analisis_actor: actor.analisis_actor || "",
        reconocimiento_redes: actor.reconocimiento_redes || "",
      });
    } else if (open && !actor) {
      // Reset form when creating new actor
      form.reset({
        nombre: "",
        categoria_id: "",
        organizacion_id: "",
        cargo_id: "",
        celular: "",
        correo: "",
        nivel: undefined,
        nivel_poder: undefined,
        relacion: undefined,
        observaciones: "",
        funciones: "",
        relacion_predominante: "",
        jerarquizacion_poder: "",
        analisis_actor: "",
        reconocimiento_redes: "",
      });
    }
  }, [open, actor, form]);

  const handleSubmit = (data: ActorFormData) => {
    onSubmit(data as unknown as CreateActorDto);
    if (!isEditMode) {
      form.reset();
    }
  };

  const handleClose = (open: boolean) => {
    onOpenChange(open);
    if (!open) {
      form.reset();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditMode ? "Editar Actor" : "Nuevo Actor"}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            <Accordion 
              type="multiple" 
              defaultValue={isEditMode ? ["importancia", "inteligencia"] : ["datos-basicos"]} 
              className="w-full"
            >
              {/* Datos Básicos */}
              <AccordionItem value="datos-basicos">
                <AccordionTrigger>Datos Básicos *</AccordionTrigger>
                <AccordionContent>
                  <div className="grid grid-cols-2 gap-4 pt-2">
                    {/* Nombre */}
                    <FormField
                      control={form.control}
                      name="nombre"
                      render={({ field }) => (
                        <FormItem className="col-span-2">
                          <FormLabel>Nombre *</FormLabel>
                          <FormControl>
                            <Input placeholder="Nombre completo" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Correo */}
                    <FormField
                      control={form.control}
                      name="correo"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Correo *</FormLabel>
                          <FormControl>
                            <Input
                              type="email"
                              placeholder="correo@ejemplo.com"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Celular */}
                    <FormField
                      control={form.control}
                      name="celular"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Celular *</FormLabel>
                          <FormControl>
                            <Input placeholder="Celular" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Organización */}
                    <FormField
                      control={form.control}
                      name="organizacion_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Organización *</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                            disabled={isLoadingOrganizaciones}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue
                                  placeholder={
                                    isLoadingOrganizaciones
                                      ? "Cargando..."
                                      : "Seleccionar organización"
                                  }
                                />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {organizaciones.map((organizacion) => (
                                <SelectItem
                                  key={organizacion.id}
                                  value={organizacion.id}
                                >
                                  {organizacion.nombre}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Cargo */}
                    <FormField
                      control={form.control}
                      name="cargo_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Cargo *</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                            disabled={isLoadingCargos}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue
                                  placeholder={
                                    isLoadingCargos
                                      ? "Cargando..."
                                      : "Seleccionar cargo"
                                  }
                                />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {cargos.map((cargo) => (
                                <SelectItem key={cargo.id} value={cargo.id}>
                                  {cargo.nombre}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Categoría */}
                    <FormField
                      control={form.control}
                      name="categoria_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Categoría *</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                            disabled={isLoadingCategorias}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue
                                  placeholder={
                                    isLoadingCategorias
                                      ? "Cargando..."
                                      : "Seleccionar categoría"
                                  }
                                />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {categorias.map((categoria) => (
                                <SelectItem key={categoria.id} value={categoria.id}>
                                  {categoria.nombre}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* Importancia */}
              <AccordionItem value="importancia">
                <AccordionTrigger>Importancia</AccordionTrigger>
                <AccordionContent>
                  <div className="grid grid-cols-2 gap-4 pt-2">
                    {/* Relación */}
                    <FormField
                      control={form.control}
                      name="relacion"
                      render={({ field }) => (
                        <FormItem className="col-span-2">
                          <FormLabel>Relación</FormLabel>
                          <Select 
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Seleccionar relación" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="A_FAVOR">A Favor</SelectItem>
                              <SelectItem value="INDIFERENTE">Indiferente</SelectItem>
                              <SelectItem value="EN_CONTRA">En Contra</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Nivel de Poder */}
                    <FormField
                      control={form.control}
                      name="nivel_poder"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nivel de Poder</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Seleccionar" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="ALTO">Alto</SelectItem>
                              <SelectItem value="MEDIO">Medio</SelectItem>
                              <SelectItem value="BAJO">Bajo</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Nivel */}
                    <FormField
                      control={form.control}
                      name="nivel"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nivel</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Seleccionar nivel" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="PRIMER_NIVEL">
                                Primer Nivel
                              </SelectItem>
                              <SelectItem value="SEGUNDO_NIVEL">
                                Segundo Nivel
                              </SelectItem>
                              <SelectItem value="TERCER_NIVEL">
                                Tercer Nivel
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Observaciones */}
                    <FormField
                      control={form.control}
                      name="observaciones"
                      render={({ field }) => (
                        <FormItem className="col-span-2">
                          <FormLabel>Observaciones</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Observaciones adicionales"
                              className="resize-none"
                              rows={3}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* Inteligencia */}
              <AccordionItem value="inteligencia">
                <AccordionTrigger>Inteligencia</AccordionTrigger>
                <AccordionContent>
                  <div className="grid grid-cols-2 gap-4 pt-2">
                    {/* Funciones */}
                    <FormField
                      control={form.control}
                      name="funciones"
                      render={({ field }) => (
                        <FormItem className="col-span-2">
                          <FormLabel>Funciones</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Funciones del actor"
                              className="resize-none"
                              rows={3}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    {/* Relación Predominante */}
                    <FormField
                      control={form.control}
                      name="relacion_predominante"
                      render={({ field }) => (
                        <FormItem className="col-span-2">
                          <FormLabel>Relación Predominante</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Relación predominante"
                              className="resize-none"
                              rows={3}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    {/* Jerarquización de Poder */}
                    <FormField
                      control={form.control}
                      name="jerarquizacion_poder"
                      render={({ field }) => (
                        <FormItem className="col-span-2">
                          <FormLabel>Jerarquización de Poder</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Jerarquización de poder"
                              className="resize-none"
                              rows={3}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    {/* Análisis del Actor */}
                    <FormField
                      control={form.control}
                      name="analisis_actor"
                      render={({ field }) => (
                        <FormItem className="col-span-2">
                          <FormLabel>Análisis del Actor</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Análisis del actor"
                              className="resize-none"
                              rows={3}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    {/* Reconocimiento de Redes */}
                    <FormField
                      control={form.control}
                      name="reconocimiento_redes"
                      render={({ field }) => (
                        <FormItem className="col-span-2">
                          <FormLabel>Reconocimiento de Redes</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Reconocimiento de redes"
                              className="resize-none"
                              rows={3}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => handleClose(false)}
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {isEditMode ? "Guardar Cambios" : "Crear Actor"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
