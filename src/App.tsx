import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Provider } from "react-redux";
import { store } from "@/presentation/store";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/presentation/components/layout/AppSidebar";
import { AuthProvider } from "@/presentation/context/AuthContext";
import { ProtectedRoute } from "@/presentation/components/auth/ProtectedRoute";
import Dashboard from "./pages/Dashboard";
import Actors from "./pages/Actors";
import Catalogos from "./pages/Catalogos";
import Login from "./pages/Login";
import Register from "./pages/Register";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <Provider store={store}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route
                path="/*"
                element={
                  <ProtectedRoute>
                    <SidebarProvider>
                      <div className="min-h-screen flex w-full bg-background">
                        <AppSidebar />
                        <div className="flex-1 flex flex-col">
                          <header className="h-14 border-b border-border bg-card flex items-center px-4">
                            <SidebarTrigger />
                            <div className="ml-4">
                              <h2 className="text-lg font-semibold text-foreground">
                                Stakeholder Matrix
                              </h2>
                            </div>
                          </header>
                          <main className="flex-1 p-6 overflow-auto">
                            <Routes>
                              <Route path="/" element={<Dashboard />} />
                              <Route path="/actores" element={<Actors />} />
                              <Route path="/catalogos" element={<Catalogos />} />
                              <Route path="*" element={<NotFound />} />
                            </Routes>
                          </main>
                        </div>
                      </div>
                    </SidebarProvider>
                  </ProtectedRoute>
                }
              />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </Provider>
  </QueryClientProvider>
);

export default App;
