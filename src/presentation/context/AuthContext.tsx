/**
 * Presentation Context: Authentication
 * Manages auth state and automatic token refresh
 */

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { authService, UserInfo } from "@/infrastructure/services/authService";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";

interface AuthContextType {
  user: UserInfo | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (correo: string, contrasena: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const REFRESH_INTERVAL = 5 * 60 * 1000; // 25 minutes (before 30 min expiration)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Check authentication on mount
  useEffect(() => {
    checkAuth();
  }, []);

  // Setup automatic token refresh
  useEffect(() => {
    if (!user) return;

    const intervalId = setInterval(async () => {
      try {
        await authService.refresh();
      } catch (error) {
        console.error("Error al refrescar token:", error);
        setUser(null);
        navigate("/login");
      }
    }, REFRESH_INTERVAL);

    return () => clearInterval(intervalId);
  }, [user, navigate]);

  const checkAuth = async () => {
    try {
      const userData = await authService.getCurrentUser();
      setUser(userData);
    } catch (error) {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Retry getCurrentUser with exponential backoff
   * This is needed because cookies may not be immediately available after login
   */
  const getCurrentUserWithRetry = async (maxRetries = 3, delay = 100): Promise<UserInfo> => {
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        console.log(`🔄 [RETRY] Intento ${attempt + 1}/${maxRetries}`);
        const user = await authService.getCurrentUser();
        console.log(`✅ [RETRY] Éxito en intento ${attempt + 1}`);
        return user;
      } catch (error) {
        console.error(`❌ [RETRY] Error en intento ${attempt + 1}:`, error);
        // If it's the last attempt, throw the error
        if (attempt === maxRetries - 1) {
          console.error("❌ [RETRY] Todos los intentos fallaron");
          throw error;
        }
        // Wait before retrying (exponential backoff)
        const waitTime = delay * Math.pow(2, attempt);
        console.log(`⏳ [RETRY] Esperando ${waitTime}ms antes del siguiente intento...`);
        await new Promise((resolve) => setTimeout(resolve, waitTime));
      }
    }
    throw new Error("No se pudo obtener la información del usuario");
  };

  const login = async (correo: string, contrasena: string) => {
    try {
      console.log("🔵 [LOGIN] Iniciando login...");
      
      // First, perform login (this sets the cookies)
      await authService.login({ correo, contrasena });
      console.log("🟢 [LOGIN] Login exitoso, esperando cookies...");
      
      // Wait a small moment for cookies to be available
      await new Promise((resolve) => setTimeout(resolve, 100));
      console.log("⏳ [LOGIN] Delay completado, verificando cookies...");
      console.log("🍪 [COOKIES] Cookies actuales:", document.cookie);
      
      // Retry getCurrentUser in case cookies aren't immediately available
      console.log("🔄 [LOGIN] Intentando obtener usuario...");
      const userData = await getCurrentUserWithRetry(3, 100);
      console.log("✅ [LOGIN] Usuario obtenido:", userData);
      
      setUser(userData);
      toast({
        title: "Sesión iniciada",
        description: `Bienvenido ${userData.nombre}`,
      });
      navigate("/");
    } catch (error) {
      console.error("❌ [LOGIN] Error completo:", error);
      console.error("❌ [LOGIN] Error message:", error instanceof Error ? error.message : String(error));
      console.error("❌ [LOGIN] Error stack:", error instanceof Error ? error.stack : "No stack");
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
      setUser(null);
      toast({
        title: "Sesión cerrada",
        description: "Has cerrado sesión exitosamente",
      });
      navigate("/login");
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth debe usarse dentro de AuthProvider");
  }
  return context;
}
