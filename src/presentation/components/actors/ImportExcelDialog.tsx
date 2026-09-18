/**
 * Presentation Component: Import Excel Dialog
 * Dialog for importing actors from Excel file with drag and drop
 */

import { useState, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Loader2, Upload, FileSpreadsheet, Download, X, CheckCircle2, ArrowLeft, Mail, AlertTriangle } from "lucide-react";
import { validateExcel, commitExcel, sendImportResultsEmail, BulkActorsValidationResponse, CommitExcelOptions, CommitExcelResponse } from "@/infrastructure/services/apiService";

interface ImportExcelDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ImportExcelDialog = ({
  open,
  onOpenChange,
}: ImportExcelDialogProps) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [isCommitting, setIsCommitting] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [validationResult, setValidationResult] = useState<BulkActorsValidationResponse | null>(null);
  const [commitResult, setCommitResult] = useState<CommitExcelResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [commitOptions, setCommitOptions] = useState<CommitExcelOptions>({
    allow_new_categorias: true,
    allow_new_tipos_organizacion: true,
    allow_new_organizaciones: true,
    allow_new_distritos: true,
    allow_new_municipios: true,
    allow_new_cargos: true,
    allow_incomplete_contact: false,
  });

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && (droppedFile.type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" || 
        droppedFile.name.endsWith(".xlsx") || 
        droppedFile.name.endsWith(".xls"))) {
      setFile(droppedFile);
      setValidationResult(null);
      setError(null);
    } else {
      setError("Por favor, selecciona un archivo Excel (.xlsx o .xls)");
    }
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" || 
          selectedFile.name.endsWith(".xlsx") || 
          selectedFile.name.endsWith(".xls")) {
        setFile(selectedFile);
        setValidationResult(null);
        setError(null);
      } else {
        setError("Por favor, selecciona un archivo Excel (.xlsx o .xls)");
      }
    }
  }, []);

  const handleValidate = async () => {
    if (!file) return;

    setIsValidating(true);
    setError(null);
    setValidationResult(null);

    try {
      const result = await validateExcel(file);
      setValidationResult(result);
      // Si la validación es exitosa, avanzar al paso 2
      if (result.is_valid) {
        setCurrentStep(2);
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Error al validar el archivo Excel"
      );
    } finally {
      setIsValidating(false);
    }
  };

  const handleSendEmail = async () => {
    if (!commitResult) return;

    setIsSendingEmail(true);
    setError(null);

    try {
      await sendImportResultsEmail(commitResult);
      toast({
        title: "Correo enviado",
        description: "Los resultados de la importación han sido enviados por correo electrónico",
        variant: "default",
      });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Error al enviar el correo"
      );
      toast({
        title: "Error al enviar correo",
        description: err instanceof Error ? err.message : "Error desconocido",
        variant: "destructive",
      });
    } finally {
      setIsSendingEmail(false);
    }
  };

  const formatValidationResult = (result: BulkActorsValidationResponse): string => {
    let output = "";
    
    // Estado general
    output += `=== ESTADO DE VALIDACIÓN ===\n`;
    output += `Válido: ${result.is_valid ? "✅ SÍ" : "❌ NO"}\n\n`;
    
    // Estadísticas
    output += `=== ESTADÍSTICAS ===\n`;
    output += `Total filas en Excel: ${result.stats.total_filas_excel}\n`;
    output += `Total actores detectados: ${result.stats.total_actores_detectados}\n`;
    output += `Categorías distintas: ${result.stats.categorias_distintas}\n`;
    output += `Tipos de organización distintos: ${result.stats.tipos_organizacion_distintos}\n`;
    output += `Organizaciones distintas: ${result.stats.organizaciones_distintas}\n`;
    output += `Distritos distintos: ${result.stats.distritos_distintos}\n`;
    output += `Municipios distintos: ${result.stats.municipios_distintos}\n\n`;
    
    // Errores de formato
    if (result.format_errors.length > 0) {
      output += `=== ERRORES DE FORMATO ===\n`;
      result.format_errors.forEach((err, idx) => {
        output += `${idx + 1}. Columna "${err.column}": ${err.message}\n`;
      });
      output += `\n`;
    }
    
    // Errores de fila
    if (result.row_errors.length > 0) {
      output += `=== ERRORES EN FILAS ===\n`;
      result.row_errors.forEach((err, idx) => {
        output += `${idx + 1}. Fila ${err.row_index + 1}: ${err.message}\n`;
      });
      output += `\n`;
    }
    
    // Nuevos elementos que se crearían
    if (result.new_categorias.length > 0) {
      output += `=== NUEVAS CATEGORÍAS (${result.new_categorias.length}) ===\n`;
      result.new_categorias.forEach((cat, idx) => {
        output += `${idx + 1}. ${cat}\n`;
      });
      output += `\n`;
    }
    
    if (result.new_tipos_organizacion.length > 0) {
      output += `=== NUEVOS TIPOS DE ORGANIZACIÓN (${result.new_tipos_organizacion.length}) ===\n`;
      result.new_tipos_organizacion.forEach((tipo, idx) => {
        output += `${idx + 1}. ${tipo}\n`;
      });
      output += `\n`;
    }
    
    if (result.new_organizaciones.length > 0) {
      output += `=== NUEVAS ORGANIZACIONES (${result.new_organizaciones.length}) ===\n`;
      result.new_organizaciones.forEach((org, idx) => {
        output += `${idx + 1}. ${org}\n`;
      });
      output += `\n`;
    }
    
    if (result.new_distritos.length > 0) {
      output += `=== NUEVOS DISTRITOS (${result.new_distritos.length}) ===\n`;
      result.new_distritos.forEach((dist, idx) => {
        output += `${idx + 1}. ${dist}\n`;
      });
      output += `\n`;
    }
    
    if (result.new_municipios.length > 0) {
      output += `=== NUEVOS MUNICIPIOS (${result.new_municipios.length}) ===\n`;
      result.new_municipios.forEach((mun, idx) => {
        output += `${idx + 1}. ${mun}\n`;
      });
      output += `\n`;
    }
    
    // Vista previa de actores (primeros 10)
    if (result.preview_actores.length > 0) {
      output += `=== VISTA PREVIA DE ACTORES (mostrando primeros ${Math.min(10, result.preview_actores.length)}) ===\n`;
      result.preview_actores.slice(0, 10).forEach((actor, idx) => {
        output += `\nActor ${idx + 1}:\n`;
        output += `  - Número: ${actor.numero}\n`;
        output += `  - Categoría: ${actor.categoria || "N/A"}\n`;
        output += `  - Institución: ${actor.nombre_institucion || "N/A"}\n`;
        output += `  - Líder: ${actor.nombre_lider || "N/A"}\n`;
        output += `  - Cargo/Rol: ${actor.cargo_rol || "N/A"}\n`;
        output += `  - Celular: ${actor.celular || "N/A"}\n`;
        output += `  - Correo: ${actor.correo || "N/A"}\n`;
        output += `  - Tipo Org: ${actor.tipo_organizacion || "N/A"}\n`;
        output += `  - Ubicación: ${actor.distrito || "N/A"} - ${actor.departamento || "N/A"} - ${actor.municipio || "N/A"}\n`;
        if (actor.observaciones) {
          output += `  - Observaciones: ${actor.observaciones}\n`;
        }
      });
      if (result.preview_actores.length > 10) {
        output += `\n... y ${result.preview_actores.length - 10} actores más\n`;
      }
    }
    
    return output;
  };

  const handleCommit = async () => {
    if (!file || !validationResult?.is_valid) return;

    setIsCommitting(true);
    setError(null);

    try {
      const result = await commitExcel(file, commitOptions);
      setCommitResult(result);
      
      // Invalidar todas las queries relacionadas
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["actors"] }),
        queryClient.invalidateQueries({ queryKey: ["categorias"] }),
        queryClient.invalidateQueries({ queryKey: ["organizaciones"] }),
        queryClient.invalidateQueries({ queryKey: ["tiposOrganizaciones"] }),
        queryClient.invalidateQueries({ queryKey: ["distritos"] }),
        queryClient.invalidateQueries({ queryKey: ["municipios"] }),
        queryClient.invalidateQueries({ queryKey: ["cargos"] }),
      ]);

      // Avanzar al paso 3 para mostrar la retroalimentación
      setCurrentStep(3);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Error al importar el archivo Excel"
      );
      toast({
        title: "Error al importar",
        description: err instanceof Error ? err.message : "Error desconocido",
        variant: "destructive",
      });
    } finally {
      setIsCommitting(false);
    }
  };

  const handleBack = () => {
    setCurrentStep(1);
    setError(null);
  };

  const handleClose = () => {
    setCurrentStep(1);
    setFile(null);
    setValidationResult(null);
    setCommitResult(null);
    setError(null);
    setIsDragging(false);
    setIsCommitting(false);
    setCommitOptions({
      allow_new_categorias: true,
      allow_new_tipos_organizacion: true,
      allow_new_organizaciones: true,
      allow_new_distritos: true,
      allow_new_municipios: true,
      allow_new_cargos: true,
      allow_incomplete_contact: false,
    });
    onOpenChange(false);
  };

  const handleDownloadTemplate = () => {
    // TODO: Implementar descarga de plantilla
    // Por ahora, solo mostramos un mensaje
    alert("La descarga de plantilla se implementará próximamente");
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>Importar Actores desde Excel</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-4 pr-2">
          {/* Paso 1: Subir y validar archivo */}
          {currentStep === 1 && (
            <>
              {/* Download Template Link */}
              <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                <div className="flex items-center gap-2">
                  <FileSpreadsheet className="w-5 h-5 text-primary" />
                  <span className="text-sm text-muted-foreground">
                    ¿Necesitas una plantilla?
                  </span>
                </div>
                <Button
                  type="button"
                  variant="link"
                  onClick={handleDownloadTemplate}
                  className="text-primary"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Descargar plantilla de actores
                </Button>
              </div>

              {/* Drag and Drop Area */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  isDragging
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
                }`}
              >
                {file ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-center gap-2">
                      <FileSpreadsheet className="w-8 h-8 text-primary" />
                      <div className="text-left">
                        <p className="font-medium">{file.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {(file.size / 1024).toFixed(2)} KB
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setFile(null);
                          setValidationResult(null);
                          setError(null);
                        }}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <Upload className="w-12 h-12 mx-auto text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">
                        Arrastra y suelta tu archivo Excel aquí
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        o haz clic para seleccionar
                      </p>
                    </div>
                    <input
                      type="file"
                      accept=".xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                      onChange={handleFileSelect}
                      className="hidden"
                      id="excel-file-input"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => document.getElementById("excel-file-input")?.click()}
                    >
                      Seleccionar archivo
                    </Button>
                  </div>
                )}
              </div>

              {/* Error Message */}
              {error && (
                <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                  <p className="text-sm text-destructive">{error}</p>
                </div>
              )}

              {/* Validation Loading */}
              {isValidating && (
                <div className="flex items-center justify-center gap-2 p-4">
                  <Loader2 className="w-5 h-5 animate-spin text-primary" />
                  <p className="text-sm text-muted-foreground">
                    Validando archivo Excel...
                  </p>
                </div>
              )}

              {/* Mostrar errores de validación si el archivo no es válido */}
              {validationResult && !validationResult.is_valid && !isValidating && (
                <div className="p-4 bg-muted/30 border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <p className="text-sm font-medium">Resultado de la validación:</p>
                    <span className="text-xs bg-red-500/20 text-red-700 dark:text-red-400 px-2 py-1 rounded">
                      ❌ Inválido
                    </span>
                  </div>
                  <pre className="text-xs bg-background p-3 rounded border overflow-auto max-h-[300px] whitespace-pre-wrap font-mono">
                    {formatValidationResult(validationResult)}
                  </pre>
                </div>
              )}
            </>
          )}

          {/* Paso 2: Resultado de validación y opciones de importación */}
          {currentStep === 2 && validationResult && (
            <div className="space-y-4">
              <div className="p-4 bg-muted/30 border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <p className="text-sm font-medium">Resultado de la validación:</p>
                  {validationResult.is_valid ? (
                    <span className="text-xs bg-green-500/20 text-green-700 dark:text-green-400 px-2 py-1 rounded">
                      ✅ Válido
                    </span>
                  ) : (
                    <span className="text-xs bg-red-500/20 text-red-700 dark:text-red-400 px-2 py-1 rounded">
                      ❌ Inválido
                    </span>
                  )}
                </div>
                <pre className="text-xs bg-background p-3 rounded border overflow-auto max-h-[300px] whitespace-pre-wrap font-mono">
                  {formatValidationResult(validationResult)}
                </pre>
              </div>

              {/* Opciones de importación - solo si es válido */}
              {validationResult.is_valid && (
                <div className="p-4 bg-muted/30 border rounded-lg space-y-3">
                  <p className="text-sm font-medium">Opciones de importación:</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="allow_categorias"
                        checked={commitOptions.allow_new_categorias ?? true}
                        onCheckedChange={(checked) =>
                          setCommitOptions((prev) => ({
                            ...prev,
                            allow_new_categorias: checked as boolean,
                          }))
                        }
                      />
                      <Label
                        htmlFor="allow_categorias"
                        className="text-sm font-normal cursor-pointer"
                      >
                        Permitir nuevas categorías
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="allow_tipos_org"
                        checked={commitOptions.allow_new_tipos_organizacion ?? true}
                        onCheckedChange={(checked) =>
                          setCommitOptions((prev) => ({
                            ...prev,
                            allow_new_tipos_organizacion: checked as boolean,
                          }))
                        }
                      />
                      <Label
                        htmlFor="allow_tipos_org"
                        className="text-sm font-normal cursor-pointer"
                      >
                        Permitir nuevos tipos de organización
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="allow_organizaciones"
                        checked={commitOptions.allow_new_organizaciones ?? true}
                        onCheckedChange={(checked) =>
                          setCommitOptions((prev) => ({
                            ...prev,
                            allow_new_organizaciones: checked as boolean,
                          }))
                        }
                      />
                      <Label
                        htmlFor="allow_organizaciones"
                        className="text-sm font-normal cursor-pointer"
                      >
                        Permitir nuevas organizaciones
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="allow_distritos"
                        checked={commitOptions.allow_new_distritos ?? true}
                        onCheckedChange={(checked) =>
                          setCommitOptions((prev) => ({
                            ...prev,
                            allow_new_distritos: checked as boolean,
                          }))
                        }
                      />
                      <Label
                        htmlFor="allow_distritos"
                        className="text-sm font-normal cursor-pointer"
                      >
                        Permitir nuevos distritos
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="allow_municipios"
                        checked={commitOptions.allow_new_municipios ?? true}
                        onCheckedChange={(checked) =>
                          setCommitOptions((prev) => ({
                            ...prev,
                            allow_new_municipios: checked as boolean,
                          }))
                        }
                      />
                      <Label
                        htmlFor="allow_municipios"
                        className="text-sm font-normal cursor-pointer"
                      >
                        Permitir nuevos municipios
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="allow_cargos"
                        checked={commitOptions.allow_new_cargos ?? true}
                        onCheckedChange={(checked) =>
                          setCommitOptions((prev) => ({
                            ...prev,
                            allow_new_cargos: checked as boolean,
                          }))
                        }
                      />
                      <Label
                        htmlFor="allow_cargos"
                        className="text-sm font-normal cursor-pointer"
                      >
                        Permitir nuevos cargos
                      </Label>
                    </div>
                    <div className="flex items-start space-x-2 sm:col-span-2">
                      <Checkbox
                        id="allow_incomplete_contact"
                        checked={commitOptions.allow_incomplete_contact ?? false}
                        onCheckedChange={(checked) =>
                          setCommitOptions((prev) => ({
                            ...prev,
                            allow_incomplete_contact: checked as boolean,
                          }))
                        }
                      />
                      <div className="space-y-1">
                        <Label
                          htmlFor="allow_incomplete_contact"
                          className="text-sm font-normal cursor-pointer"
                        >
                          Permitir actores con contacto incompleto
                        </Label>
                        <p className="text-xs text-muted-foreground">
                          Si se activa, también se crearán actores aunque falte celular o correo. 
                          Estos actores aparecerán listados como advertencias en el resultado final.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Paso 3: Resultado de la importación */}
          {currentStep === 3 && commitResult && (
            <div className="space-y-4">
              {/* Resumen de estadísticas - Valores importantes arriba */}
              <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                <div className="flex items-center gap-2 mb-4">
                  <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
                  <p className="text-sm font-medium text-green-700 dark:text-green-400">
                    Importación completada exitosamente
                  </p>
                </div>
                
                {/* Estadísticas principales */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-4">
                  {commitResult.actores_insertados !== undefined && (
                    <div className="bg-background p-3 rounded border">
                      <p className="text-xs text-muted-foreground mb-1">Actores insertados</p>
                      <p className="text-lg font-semibold text-green-600 dark:text-green-400">
                        {commitResult.actores_insertados}
                      </p>
                    </div>
                  )}
                  {commitResult.actores_duplicados !== undefined && commitResult.actores_duplicados > 0 && (
                    <div className="bg-background p-3 rounded border">
                      <p className="text-xs text-muted-foreground mb-1">Actores duplicados</p>
                      <p className="text-lg font-semibold text-yellow-600 dark:text-yellow-400">
                        {commitResult.actores_duplicados}
                      </p>
                    </div>
                  )}
                  {commitResult.categorias_creadas !== undefined && commitResult.categorias_creadas > 0 && (
                    <div className="bg-background p-3 rounded border">
                      <p className="text-xs text-muted-foreground mb-1">Categorías creadas</p>
                      <p className="text-lg font-semibold text-green-600 dark:text-green-400">
                        {commitResult.categorias_creadas}
                      </p>
                    </div>
                  )}
                  {commitResult.organizaciones_creadas !== undefined && commitResult.organizaciones_creadas > 0 && (
                    <div className="bg-background p-3 rounded border">
                      <p className="text-xs text-muted-foreground mb-1">Organizaciones creadas</p>
                      <p className="text-lg font-semibold text-green-600 dark:text-green-400">
                        {commitResult.organizaciones_creadas}
                      </p>
                    </div>
                  )}
                  {commitResult.tipos_organizacion_creados !== undefined && commitResult.tipos_organizacion_creados > 0 && (
                    <div className="bg-background p-3 rounded border">
                      <p className="text-xs text-muted-foreground mb-1">Tipos de organización</p>
                      <p className="text-lg font-semibold text-green-600 dark:text-green-400">
                        {commitResult.tipos_organizacion_creados}
                      </p>
                    </div>
                  )}
                  {commitResult.distritos_creados !== undefined && commitResult.distritos_creados > 0 && (
                    <div className="bg-background p-3 rounded border">
                      <p className="text-xs text-muted-foreground mb-1">Distritos creados</p>
                      <p className="text-lg font-semibold text-green-600 dark:text-green-400">
                        {commitResult.distritos_creados}
                      </p>
                    </div>
                  )}
                  {commitResult.municipios_creados !== undefined && commitResult.municipios_creados > 0 && (
                    <div className="bg-background p-3 rounded border">
                      <p className="text-xs text-muted-foreground mb-1">Municipios creados</p>
                      <p className="text-lg font-semibold text-green-600 dark:text-green-400">
                        {commitResult.municipios_creados}
                      </p>
                    </div>
                  )}
                  {commitResult.cargos_creados !== undefined && commitResult.cargos_creados > 0 && (
                    <div className="bg-background p-3 rounded border">
                      <p className="text-xs text-muted-foreground mb-1">Cargos creados</p>
                      <p className="text-lg font-semibold text-green-600 dark:text-green-400">
                        {commitResult.cargos_creados}
                      </p>
                    </div>
                  )}
                </div>

              </div>

              {/* Actores duplicados, errores y actores con datos incompletos - Formato log abajo */}
              {((commitResult.actores_duplicados_lista && commitResult.actores_duplicados_lista.length > 0) ||
                (commitResult.errores && commitResult.errores.length > 0) ||
                (commitResult.actores_con_datos_incompletos && commitResult.actores_con_datos_incompletos.length > 0)) && (
                <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                  <div className="flex items-center gap-2 mb-3">
                    <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                    <p className="text-sm font-medium text-yellow-700 dark:text-yellow-400">
                      Advertencias, Errores y Notas
                    </p>
                  </div>
                  <div className="space-y-3">
                    {commitResult.actores_duplicados_lista && commitResult.actores_duplicados_lista.length > 0 && (
                      <div>
                        <p className="text-xs font-medium text-muted-foreground mb-2">
                          Actores duplicados ({commitResult.actores_duplicados_lista.length}):
                        </p>
                        <pre className="text-xs bg-background p-3 rounded border overflow-auto max-h-[200px] whitespace-pre-wrap font-mono">
                          {commitResult.actores_duplicados_lista.map((dup, idx) => `[DUPLICADO ${idx + 1}] ${dup}`).join("\n")}
                        </pre>
                      </div>
                    )}
                    {commitResult.errores && commitResult.errores.length > 0 && (
                      <div>
                        <p className="text-xs font-medium text-muted-foreground mb-2">Errores ({commitResult.errores.length}):</p>
                        <pre className="text-xs bg-background p-3 rounded border overflow-auto max-h-[200px] whitespace-pre-wrap font-mono">
                          {commitResult.errores.map((err, idx) => `[ERROR ${idx + 1}] ${err}`).join("\n")}
                        </pre>
                      </div>
                    )}
                    {commitResult.actores_con_datos_incompletos && commitResult.actores_con_datos_incompletos.length > 0 && (
                      <div>
                        <p className="text-xs font-medium text-muted-foreground mb-2">
                          Actores con datos incompletos ({commitResult.actores_con_datos_incompletos.length}):
                        </p>
                        <pre className="text-xs bg-background p-3 rounded border overflow-auto max-h-[200px] whitespace-pre-wrap font-mono">
                          {commitResult.actores_con_datos_incompletos.map((actor, idx) => 
                            `[ACTOR ${idx + 1}] Fila ${actor.fila}: ${actor.nombre} - ${actor.motivo}`
                          ).join("\n")}
                        </pre>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter className="flex-shrink-0 border-t pt-4 mt-4 flex justify-around">
          {currentStep === 1 ? (
            <>
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isValidating || isCommitting}
              >
                Cerrar
              </Button>
              <Button
                type="button"
                onClick={handleValidate}
                disabled={!file || isValidating}
              >
                {isValidating && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Validar Excel
              </Button>
            </>
          ) : currentStep === 2 ? (
            <>
              <Button
                type="button"
                variant="outline"
                onClick={handleBack}
                disabled={isCommitting}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver
              </Button>
              <Button
                type="button"
                onClick={handleCommit}
                disabled={!file || isCommitting || !validationResult?.is_valid}
              >
                {isCommitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Importando...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Importar Excel
                  </>
                )}
              </Button>
            </>
          ) : (
            <>
              <Button
                type="button"
                variant="outline"
                onClick={() => alert("Funcionalidad prevista para la versión 2.0")}
                disabled={isSendingEmail}
              >
                {isSendingEmail ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Mail className="w-4 h-4 mr-2" />
                    Enviar por correo
                  </>
                )}
              </Button>
              <Button
                type="button"
                onClick={handleClose}
              >
                Finalizar
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};


