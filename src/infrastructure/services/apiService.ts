/**
 * Infrastructure Service: API Service
 * Handles HTTP requests with authentication and CSRF protection
 */

const API_BASE = import.meta.env.VITE_API_BASE_URL;

/**
 * Get CSRF token from cookies
 */
function getCsrfToken(): string | null {
  const cookies = document.cookie.split(";");
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split("=");
    if (name === "csrf_token") {
      return decodeURIComponent(value);
    }
  }
  return null;
}

/**
 * Make authenticated API request
 */
export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const csrfToken = getCsrfToken();
  
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  // Add CSRF token to header if available
  if (csrfToken) {
    headers["X-CSRF-Token"] = csrfToken;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
    credentials: "include", // Important for cookies
  });

  if (!response.ok) {
    // Try to parse error message
    let errorMessage = "Error en la petición";
    try {
      const errorData = await response.json();
      if (errorData.detail) {
        if (Array.isArray(errorData.detail)) {
          errorMessage = errorData.detail.map((e: any) => e.msg).join(", ");
        } else {
          errorMessage = errorData.detail;
        }
      }
    } catch {
      // If response is not JSON, use status text
      errorMessage = `Error ${response.status}: ${response.statusText}`;
    }
    
    // Create error with status code for better handling
    const error = new Error(errorMessage) as Error & { status?: number };
    error.status = response.status;
    throw error;
  }

  // Handle 204 No Content
  if (response.status === 204) {
    return undefined as T;
  }

  return response.json();
}

/**
 * Actors Filter Parameters
 */
export interface ActorsFilterParams {
  page?: number;
  page_size?: number;
  nombre?: string | null;
  categoria_id?: number | null;
  organizacion_id?: number | null;
  cargo_id?: number | null;
  nivel_poder?: "ALTO" | "MEDIO" | "BAJO" | null;
  nivel?: "PRIMER_NIVEL" | "SEGUNDO_NIVEL" | "TERCER_NIVEL" | null;
  relacion?: "A_FAVOR" | "INDIFERENTE" | "EN_CONTRA" | null;
  celular?: string | null;
  correo?: string | null;
}

/**
 * Paginated Actors Response
 */
export interface PaginatedActorsResponse {
  items: Array<{
    id: number;
    nombre: string;
    categoria_id: number;
    organizacion_id?: number | null;
    cargo_id?: number | null;
    celular?: string | null;
    correo?: string | null;
    nivel_poder?: "ALTO" | "MEDIO" | "BAJO" | null;
    nivel?: "PRIMER_NIVEL" | "SEGUNDO_NIVEL" | "TERCER_NIVEL" | null;
    relacion?: "A_FAVOR" | "INDIFERENTE" | "EN_CONTRA" | null;
    funciones?: string | null;
    relacion_predominante?: string | null;
    jerarquizacion_poder?: string | null;
    analisis_actor?: string | null;
    reconocimiento_redes?: string | null;
    observaciones?: string | null;
  }>;
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

/**
 * Bulk Actors Validation Response
 */
export interface BulkActorsValidationResponse {
  is_valid: boolean;
  format_errors: Array<{ column: string; message: string }>;
  row_errors: Array<{ row_index: number; message: string }>;
  stats: {
    total_filas_excel: number;
    total_actores_detectados: number;
    categorias_distintas: number;
    tipos_organizacion_distintos: number;
    organizaciones_distintas: number;
    distritos_distintos: number;
    municipios_distintos: number;
  };
  new_categorias: string[];
  new_tipos_organizacion: string[];
  new_organizaciones: string[];
  new_distritos: string[];
  new_municipios: string[];
  preview_actores: Array<{
    numero: number;
    categoria: string | null;
    nombre_institucion: string | null;
    nombre_lider: string | null;
    cargo_rol: string | null;
    celular: string | null;
    correo: string | null;
    tipo_organizacion: string | null;
    distrito: string | null;
    departamento: string | null;
    municipio: string | null;
    observaciones: string | null;
  }>;
}

/**
 * Validate Excel file for actors import
 */
export async function validateExcel(file: File): Promise<BulkActorsValidationResponse> {
  const csrfToken = getCsrfToken();
  
  const formData = new FormData();
  formData.append("file", file);

  const headers: HeadersInit = {};
  
  // Add CSRF token to header if available
  if (csrfToken) {
    headers["X-CSRF-Token"] = csrfToken;
  }

  const response = await fetch(`${API_BASE}/api/v1/importar-excel/validar`, {
    method: "POST",
    headers,
    body: formData,
    credentials: "include", // Important for cookies
  });

  if (!response.ok) {
    // Try to parse error message
    let errorMessage = "Error al validar el archivo Excel";
    try {
      const errorData = await response.json();
      if (errorData.detail) {
        if (Array.isArray(errorData.detail)) {
          errorMessage = errorData.detail.map((e: any) => e.msg).join(", ");
        } else {
          errorMessage = errorData.detail;
        }
      }
    } catch {
      // If response is not JSON, use status text
      errorMessage = `Error ${response.status}: ${response.statusText}`;
    }
    
    throw new Error(errorMessage);
  }

  return response.json();
}

/**
 * Commit Excel file for actors import
 */
export interface CommitExcelOptions {
  allow_new_categorias?: boolean;
  allow_new_tipos_organizacion?: boolean;
  allow_new_organizaciones?: boolean;
  allow_new_distritos?: boolean;
  allow_new_municipios?: boolean;
  allow_new_cargos?: boolean;
  // Permitir crear actores aunque falte celular o correo
  allow_incomplete_contact?: boolean;
}

/**
 * Actor Incompleto - Actor con datos incompletos
 */
export interface ActorIncompleto {
  fila: number;
  nombre: string;
  motivo: string;
}

/**
 * Commit Excel Response - Feedback about what was inserted
 * Based on CommitResponse schema from swagger
 */
export interface CommitExcelResponse {
  msg?: string;
  actores_insertados?: number;
  actores_duplicados?: number;
  actores_duplicados_lista?: string[] | null;
  distritos_creados?: number;
  municipios_creados?: number;
  categorias_creadas?: number;
  tipos_organizacion_creados?: number;
  organizaciones_creadas?: number;
  cargos_creados?: number;
  actores_con_datos_incompletos?: ActorIncompleto[] | null;
  errores?: string[] | null;
}

export async function commitExcel(
  file: File,
  options: CommitExcelOptions = {}
): Promise<CommitExcelResponse> {
  const csrfToken = getCsrfToken();
  
  const formData = new FormData();
  formData.append("file", file);

  const headers: HeadersInit = {};
  
  // Add CSRF token to header if available
  if (csrfToken) {
    headers["X-CSRF-Token"] = csrfToken;
  }

  // Build query parameters
  const queryParams = new URLSearchParams();
  if (options.allow_new_categorias !== undefined) {
    queryParams.append("allow_new_categorias", String(options.allow_new_categorias));
  }
  if (options.allow_new_tipos_organizacion !== undefined) {
    queryParams.append("allow_new_tipos_organizacion", String(options.allow_new_tipos_organizacion));
  }
  if (options.allow_new_organizaciones !== undefined) {
    queryParams.append("allow_new_organizaciones", String(options.allow_new_organizaciones));
  }
  if (options.allow_new_distritos !== undefined) {
    queryParams.append("allow_new_distritos", String(options.allow_new_distritos));
  }
  if (options.allow_new_municipios !== undefined) {
    queryParams.append("allow_new_municipios", String(options.allow_new_municipios));
  }
  if (options.allow_new_cargos !== undefined) {
    queryParams.append("allow_new_cargos", String(options.allow_new_cargos));
  }
  if (options.allow_incomplete_contact !== undefined) {
    queryParams.append("allow_incomplete_contact", String(options.allow_incomplete_contact));
  }

  const queryString = queryParams.toString();
  const url = `${API_BASE}/api/v1/importar-excel/commit${queryString ? `?${queryString}` : ""}`;

  const response = await fetch(url, {
    method: "POST",
    headers,
    body: formData,
    credentials: "include", // Important for cookies
  });

  if (!response.ok) {
    // Try to parse error message
    let errorMessage = "Error al importar el archivo Excel";
    try {
      const errorData = await response.json();
      if (errorData.detail) {
        if (Array.isArray(errorData.detail)) {
          errorMessage = errorData.detail.map((e: any) => e.msg).join(", ");
        } else {
          errorMessage = errorData.detail;
        }
      }
    } catch {
      // If response is not JSON, use status text
      errorMessage = `Error ${response.status}: ${response.statusText}`;
    }
    
    throw new Error(errorMessage);
  }

  // Handle 204 No Content
  if (response.status === 204) {
    return {};
  }

  // Try to parse JSON response
  try {
    const data = await response.json();
    return data as CommitExcelResponse;
  } catch {
    // If not JSON, return empty object
    return {};
  }
}

/**
 * Send import results and warnings via email
 * Maps CommitExcelResponse to CommitEmailRequest format
 * Based on CommitEmailRequest schema from swagger
 */
export interface CommitEmailRequest {
  msg: string;
  actores_insertados: number;
  actores_duplicados: number;
  actores_duplicados_lista?: string[] | null;
  distritos_creados: number;
  municipios_creados: number;
  categorias_creadas: number;
  tipos_organizacion_creados: number;
  organizaciones_creadas: number;
  cargos_creados: number;
  actores_con_datos_incompletos?: ActorIncompleto[] | null;
  errores?: string[] | null;
}

export async function sendImportResultsEmail(
  commitResult: CommitExcelResponse
): Promise<{ message: string }> {
  const csrfToken = getCsrfToken();
  
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };
  
  // Add CSRF token to header if available
  if (csrfToken) {
    headers["X-CSRF-Token"] = csrfToken;
  }

  // Map CommitExcelResponse to CommitEmailRequest format
  // The response already matches the email request format
  const emailRequest: CommitEmailRequest = {
    msg: commitResult.msg || "Resumen de importación de actores",
    actores_insertados: commitResult.actores_insertados ?? 0,
    actores_duplicados: commitResult.actores_duplicados ?? 0,
    actores_duplicados_lista: commitResult.actores_duplicados_lista ?? null,
    distritos_creados: commitResult.distritos_creados ?? 0,
    municipios_creados: commitResult.municipios_creados ?? 0,
    categorias_creadas: commitResult.categorias_creadas ?? 0,
    tipos_organizacion_creados: commitResult.tipos_organizacion_creados ?? 0,
    organizaciones_creadas: commitResult.organizaciones_creadas ?? 0,
    cargos_creados: commitResult.cargos_creados ?? 0,
    actores_con_datos_incompletos: commitResult.actores_con_datos_incompletos ?? null,
    errores: commitResult.errores ?? null,
  };

  const response = await fetch(`${API_BASE}/api/v1/importar-excel/enviar-resumen`, {
    method: "POST",
    headers,
    body: JSON.stringify(emailRequest),
    credentials: "include", // Important for cookies
  });

  if (!response.ok) {
    // Try to parse error message
    let errorMessage = "Error al enviar el correo";
    try {
      const errorData = await response.json();
      if (errorData.detail) {
        if (Array.isArray(errorData.detail)) {
          errorMessage = errorData.detail.map((e: any) => e.msg).join(", ");
        } else {
          errorMessage = errorData.detail;
        }
      }
    } catch {
      // If response is not JSON, use status text
      errorMessage = `Error ${response.status}: ${response.statusText}`;
    }
    
    throw new Error(errorMessage);
  }

  // Handle 204 No Content
  if (response.status === 204) {
    return { message: "Correo enviado exitosamente" };
  }

  // Try to parse JSON response
  try {
    return await response.json();
  } catch {
    return { message: "Correo enviado exitosamente" };
  }
}

