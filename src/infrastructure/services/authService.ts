/**
 * Infrastructure Service: Authentication
 * Handles all auth API calls with cookie-based tokens
 */

const API_BASE = import.meta.env.VITE_API_BASE_URL;

// Debug: Log API configuration
console.log("🌐 [CONFIG] API_BASE:", API_BASE);

export interface LoginCredentials {
  correo: string;
  contrasena: string;
}

export interface SignupCredentials {
  nombre: string;
  correo: string;
  contrasena: string;
}

export interface UserInfo {
  id: number;
  nombre: string;
  correo: string;
}

class AuthService {
  async login(credentials: LoginCredentials): Promise<void> {
     try {
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
        credentials: "include", // Important for cookies
      });

      if (!response.ok) {
        // Try to parse error message from API
        let errorMessage = "Error al iniciar sesión";
        try {
          const errorData = await response.json(); 
          if (errorData.detail) {
            if (Array.isArray(errorData.detail)) {
              errorMessage = errorData.detail.map((e: any) => e.msg || e.message || String(e)).join(", ");
            } else {
              errorMessage = errorData.detail;
            }
          } else if (errorData.message) {
            errorMessage = errorData.message;
          }
        } catch {
          // If response is not JSON, use status text
          if (response.status === 401 || response.status === 403) {
            errorMessage = "Credenciales incorrectas";
          } else {
            errorMessage = `Error ${response.status}: ${response.statusText}`;
          }
        }
        throw new Error(errorMessage);
      }
    } catch (error) {
      // Handle CORS and network errors
      if (error instanceof TypeError && error.message.includes("Failed to fetch") || error.message.includes("Load failed")) {
        const corsError = "Error de CORS: El servidor no está configurado correctamente. " +
          "El servidor debe usar 'Access-Control-Allow-Origin' con el origen específico del frontend " +
          "(ej: http://localhost:5173) en lugar de '*', y debe incluir 'Access-Control-Allow-Credentials: true'.";
        console.error("❌ [AUTH] Error de CORS detectado:", corsError);
        throw new Error(corsError);
      }
      // Re-throw other errors
      throw error;
    }
  }

  async signup(credentials: SignupCredentials): Promise<UserInfo> {
    const response = await fetch(`${API_BASE}/auth/signup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(credentials),
      credentials: "include", // Important for cookies
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: "Error al registrar usuario" }));
      throw new Error(error.detail || "Error al registrar usuario");
    }

    return response.json();
  }

  async refresh(): Promise<void> {
    const response = await fetch(`${API_BASE}/auth/refresh`, {
      method: "POST",
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error("No se pudo refrescar el token");
    }
  }

  async logout(): Promise<void> {
    const response = await fetch(`${API_BASE}/auth/logout`, {
      method: "POST",
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error("Error al cerrar sesión");
    }
  }

  async getCurrentUser(): Promise<UserInfo> {
    console.log("🔵 [AUTH] Llamando a /auth/me");
    console.log("🍪 [AUTH] Cookies antes de request:", document.cookie);
    const url = `${API_BASE}/auth/me`;
    console.log("🌐 [AUTH] URL completa:", url);
    
    const response = await fetch(url, {
      method: "GET",
      credentials: "include",
    });

    console.log("📡 [AUTH] Response status:", response.status);
    console.log("📡 [AUTH] Response headers:", Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      // Try to parse error message from API
      let errorMessage = "No autenticado";
      let errorBody = null;
      try {
        errorBody = await response.json();
        console.error("❌ [AUTH] Error response body:", errorBody);
        if (errorBody.detail) {
          if (Array.isArray(errorBody.detail)) {
            errorMessage = errorBody.detail.map((e: any) => e.msg || e.message || String(e)).join(", ");
          } else {
            errorMessage = errorBody.detail;
          }
        } else if (errorBody.message) {
          errorMessage = errorBody.message;
        }
      } catch (parseError) {
        console.error("❌ [AUTH] Error al parsear respuesta de error:", parseError);
        // If response is not JSON, use status text
        if (response.status === 401 || response.status === 403) {
          errorMessage = "No autenticado. Por favor inicia sesión nuevamente.";
        } else {
          errorMessage = `Error ${response.status}: ${response.statusText}`;
        }
      }
      throw new Error(errorMessage);
    }

    const userData = await response.json();
    console.log("✅ [AUTH] Usuario obtenido:", userData);
    return userData;
  }
}

export const authService = new AuthService();
