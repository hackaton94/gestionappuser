import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/components/auth-provider";
import { ProtectedRoute } from "@/components/protected-route";

// Import des pages
import Home from "@/pages/home";
import Login from "@/pages/login";
import Register from "@/pages/register";
import UserDashboard from "@/pages/user-dashboard";
import AdminDashboard from "@/pages/admin-dashboard";
import NotFound from "@/pages/not-found";

// Composant de routage principal pour l'application
function Router() {
  return (
    <Switch>
      {/* Page d'accueil publique */}
      <Route path="/" component={Home} />
      {/* Retour à la page d'accueil */}
      <Route path="/retour" component={Home} />

      {/* Routes d'authentification */}
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      
      {/* Dashboard utilisateur simple - nécessite authentification */}
      <Route path="/dashboard">
        <ProtectedRoute>
          <UserDashboard />
        </ProtectedRoute>
      </Route>
      
      <Route path="/dashboard/:section?">
        <ProtectedRoute>
          <UserDashboard />
        </ProtectedRoute>
      </Route>
      
      {/* Dashboard administrateur - nécessite authentification + rôle admin */}
      <Route path="/admin">
        <ProtectedRoute requireAdmin>
          <AdminDashboard />
        </ProtectedRoute>
      </Route>
      
      <Route path="/admin/:section?">
        <ProtectedRoute requireAdmin>
          <AdminDashboard />
        </ProtectedRoute>
      </Route>
      
      {/* Page 404 pour les routes non trouvées */}
      <Route component={NotFound} />
    </Switch>
  );
}

// Composant principal de l'application avec tous les providers nécessaires
function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <div className="min-h-screen bg-gray-50">
            <Router />
          </div>
          <Toaster />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
