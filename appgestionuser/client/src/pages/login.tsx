import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, type LoginCredentials } from '@shared/schema';
import { useAuthContext } from '@/components/auth-provider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Users, LogIn, Loader2, AlertCircle } from 'lucide-react';

// Page de connexion avec formulaire d'authentification
export default function Login() {
  const { login, isLoading, isAuthenticated } = useAuthContext();
  const [, navigate] = useLocation();
  const [error, setError] = useState<string>('');

  // Configuration du formulaire avec validation Zod
  const form = useForm<LoginCredentials>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  // Redirection si déjà connecté
  if (isAuthenticated) {
    navigate('/dashboard');
    return null;
  }

  // Gestionnaire de soumission du formulaire
  const onSubmit = async (data: LoginCredentials) => {
    setError('');
    
    try {
      const result = await login(data.email, data.password);
      
      if (result.success) {
        // Redirection vers le dashboard approprié selon le rôle
        // La logique de redirection est gérée dans le AuthProvider
        navigate('/dashboard');
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError('Une erreur inattendue est survenue');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-purple-50 to-blue-50">
      <div className="max-w-md w-full space-y-8">
        {/* En-tête avec logo et titre */}
        <div className="text-center fade-in">
          <div className="mx-auto h-16 w-16 bg-primary rounded-full flex items-center justify-center shadow-lg">
            <Users className="h-8 w-8 text-white" />
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Connexion
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Accédez à votre espace personnel
          </p>
        </div>

        {/* Formulaire de connexion */}
        <Card className="shadow-xl border-0">
          <CardContent className="pt-6">
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              
              {/* Affichage des erreurs */}
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Champ Email */}
              <div className="space-y-2">
                <Label htmlFor="email" className="form-label">
                  Adresse email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="angenor@email.com"
                  className="form-input"
                  {...form.register('email')}
                />
                {form.formState.errors.email && (
                  <p className="text-sm text-red-600">
                    {form.formState.errors.email.message}
                  </p>
                )}
              </div>

              {/* Champ Mot de passe */}
              <div className="space-y-2">
                <Label htmlFor="password" className="form-label">
                  Mot de passe
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  className="form-input"
                  {...form.register('password')}
                />
                {form.formState.errors.password && (
                  <p className="text-sm text-red-600">
                    {form.formState.errors.password.message}
                  </p>
                )}
              </div>

              {/* Bouton de connexion */}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full btn-primary h-12 text-base font-medium"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Connexion en cours...
                  </>
                ) : (
                  <>
                    <LogIn className="mr-2 h-4 w-4" />
                    Se connecter
                  </>
                )}
              </Button>

              {/* Lien vers l'inscription */}
              <div className="text-center">
                <p className="text-sm text-gray-600">
                  Pas encore de compte ?{' '}
                  <Link href="/register">
                    <span className="font-medium text-primary hover:text-primary/80 cursor-pointer">
                      S'inscrire
                    </span>
                  </Link>
                </p>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Informations de démonstration 
       <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-4">
            <h3 className="text-sm font-medium text-blue-800 mb-2">
              Comptes de démonstration
            </h3>
            <div className="space-y-2 text-xs text-blue-700">
              <div>
                <strong>Administrateur :</strong> angenor@email.com / admin123
              </div>
              <div>
                <strong>Utilisateur :</strong> marie.dubois@email.com / password123
              </div>
            </div>
          </CardContent>
        </Card>*/}
           <div className="text-center">
                  <Link href="/retour">
                    <Button className="btn-perso">Retour</Button>
                  </Link>
       </div>
      </div>
    </div>

  );
}
