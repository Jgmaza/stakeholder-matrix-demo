/**
 * Presentation Component: Actor Table
 * Lists all actors with filtering and actions
 */

import { Actor } from "@/domain/entities/Actor";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, Mail, Phone, Pencil } from "lucide-react";

interface ActorTableProps {
  actors: Actor[];
  onViewActor?: (actor: Actor) => void;
  onEditActor?: (actor: Actor) => void;
}

export const ActorTable = ({ actors, onViewActor, onEditActor }: ActorTableProps) => {
  const getCategoryVariant = (categoria: string) => {
    const variants: Record<string, "default" | "secondary" | "outline"> = {
      gobierno: "default",
      comunidad: "secondary",
      empresa: "outline",
    };
    return variants[categoria] || "outline";
  };

  const getRelacionText = (relacion?: string) => {
    if (!relacion) return "-";
    return relacion.replace("_", " ");
  };

  return (
    <div className="rounded-lg border border-border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="font-semibold">Nombre</TableHead>
            <TableHead className="font-semibold">Categoría</TableHead>
            <TableHead className="font-semibold">Organización</TableHead>
            <TableHead className="font-semibold">Cargo</TableHead>
            <TableHead className="font-semibold">Contacto</TableHead>
            <TableHead className="font-semibold">Relación</TableHead>
            <TableHead className="font-semibold text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {actors.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                No se encontraron actores
              </TableCell>
            </TableRow>
          ) : (
            actors.map((actor) => (
              <TableRow key={actor.id} className="hover:bg-muted/30 transition-colors">
                <TableCell className="font-medium">{actor.nombre}</TableCell>
                <TableCell>
                  <Badge variant={getCategoryVariant(actor.categoria || "")}>
                    {actor.categoria || ""}
                  </Badge>
                </TableCell>
                <TableCell className="max-w-xs truncate">{actor.organizacion || ""}</TableCell>
                <TableCell className="max-w-xs truncate">{actor.cargo || ""}</TableCell>
                <TableCell>
                  <div className="flex flex-col gap-1">
                    <a
                      href={`mailto:${actor.correo || ""}`}
                      className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"
                    >
                      <Mail className="w-3 h-3" />
                      <span className="truncate max-w-[150px]">{actor.correo || ""}</span>
                    </a>
                    <a
                      href={`tel:${actor.celular || ""}`}
                      className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"
                    >
                      <Phone className="w-3 h-3" />
                      <span>{actor.celular}</span>
                    </a>
                  </div>
                </TableCell>
                <TableCell>
                  {actor.relacion && (
                    <Badge variant="secondary" className="text-xs">
                      {getRelacionText(actor.relacion)}
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-0">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onViewActor?.(actor)}
                      title="Ver detalles"
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEditActor?.(actor)}
                      title="Editar actor"
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};
