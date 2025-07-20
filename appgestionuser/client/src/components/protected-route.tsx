import { useEffect } from 'react';
import { useLocation, useRouter } from 'wouter';
import { useAuthContext } from './auth-provider';
import { Card, CardContent } from './ui/card';
import { Loader2 } from 'lucide-react';

// Composant pour protéger les routes selon l'authentification et le rôle
interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean; // Si true, seuls les admins peuvent accéder
}

export function ProtectedRoute({ children, requireAdmin = false }: ProtectedRouteProps) {
  const { user, isAuthenticated, isLoading, isAdmin } = useAuthContext();
  const [, navigate] = useRouter();
  const [location] = useLocation();

  useEffect(() => {
    // Si le chargement est terminé et l'utilisateur n'est pas authentifié
    if (!isLoading && !isAuthenticated) {
      navigate('/login');
      return;
    }

    // Si l'utilisateur est authentifié mais n'a pas les droits admin requis
    if (!isLoading && isAuthenticated && requireAdmin && !isAdmin()) {
      navigate('/dashboard'); // Rediriger vers son dashboard
      return;
    }
  }, [isLoading, isAuthenticated, requireAdmin, isAdmin, navigate]);

  // Afficher un spinner pendant le chargement
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
            <p className="text-gray-600">Vérification de l'authentification...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Si pas authentifié, ne rien afficher (la redirection se fera)
  if (!isAuthenticated) {
    return null;
  }

  // Si admin requis mais utilisateur simple, ne rien afficher (redirection en cours)
  if (requireAdmin && !isAdmin()) {
    return null;
  }

  // Afficher le contenu protégé
  return <>{children}</>;
}
