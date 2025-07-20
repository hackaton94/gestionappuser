import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { insertUserSchema, type InsertUser } from '@shared/schema';
import { useAuthContext } from '@/components/auth-provider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { UserPlus, Users, Loader2, AlertCircle, Crown, User } from 'lucide-react';

// Page d'inscription avec formulaire de création de compte
export default function Register() {
  const { register: registerUser, isLoading, isAuthenticated } = useAuthContext();
  const [, navigate] = useLocation();
  const [error, setError] = useState<string>('');

  // Configuration du formulaire avec validation Zod
  const form = useForm<InsertUser>({
    resolver: zodResolver(insertUserSchema),
    defaultValues: {
      nom: '',
      prenoms: '',
      email: '',
      password: '',
      role: 'user',
    },
  });

  // Redirection si déjà connecté
  if (isAuthenticated) {
    navigate('/dashboard');
    return null;
  }

  // Gestionnaire de soumission du formulaire
  const onSubmit = async (data: InsertUser) => {
    setError('');
    
    try {
      const result = await registerUser(data);
      
      if (result.success) {
        // Redirection vers le dashboard approprié selon le rôle
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
            <UserPlus className="h-8 w-8 text-white" />
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Inscription
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Créez votre compte pour commencer
          </p>
        </div>

        {/* Formulaire d'inscription */}
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

              {/* Nom et Prénoms */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nom" className="form-label">
                    Nom
                  </Label>
                  <Input
                    id="nom"
                    placeholder="Blami"
                    className="form-input"
                    {...form.register('nom')}
                  />
                  {form.formState.errors.nom && (
                    <p className="text-sm text-red-600">
                      {form.formState.errors.nom.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="prenoms" className="form-label">
                    Prénoms
                  </Label>
                  <Input
                    id="prenoms"
                    placeholder="Angenor"
                    className="form-input"
                    {...form.register('prenoms')}
                  />
                  {form.formState.errors.prenoms && (
                    <p className="text-sm text-red-600">
                      {form.formState.errors.prenoms.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Email */}
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

              {/* Mot de passe */}
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

              {/* Sélection du rôle */}
              <div className="space-y-3">
                <Label className="form-label">Rôle</Label>
                <RadioGroup
                  defaultValue="user"
                  onValueChange={(value: 'user' | 'admin') => form.setValue('role', value)}
                  className="space-y-3"
                >
                  <div className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <RadioGroupItem value="user" id="role-user" />
                    <div className="flex items-center space-x-3 flex-1">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <Label htmlFor="role-user" className="font-medium text-gray-900 cursor-pointer">
                          Utilisateur Simple
                        </Label>
                        <p className="text-sm text-gray-500">
                          Accès en lecture seulement aux fichiers
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <RadioGroupItem value="admin" id="role-admin" />
                    <div className="flex items-center space-x-3 flex-1">
                      <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                        <Crown className="w-5 h-5 text-yellow-600" />
                      </div>
                      <div>
                        <Label htmlFor="role-admin" className="font-medium text-gray-900 cursor-pointer">
                          Administrateur
                        </Label>
                        <p className="text-sm text-gray-500">
                          Accès complet à la gestion des utilisateurs et fichiers
                        </p>
                      </div>
                    </div>
                  </div>
                </RadioGroup>
                {form.formState.errors.role && (
                  <p className="text-sm text-red-600">
                    {form.formState.errors.role.message}
                  </p>
                )}
              </div>

              {/* Bouton d'inscription */}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full btn-primary h-12 text-base font-medium"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Création du compte...
                  </>
                ) : (
                  <>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Créer mon compte
                  </>
                )}
              </Button>

              {/* Lien vers la connexion */}
              <div className="text-center">
                <p className="text-sm text-gray-600">
                  Déjà un compte ?{' '}
                  <Link href="/login">
                    <span className="font-medium text-primary hover:text-primary/80 cursor-pointer">
                      Se connecter
                    </span>
                  </Link>
                </p>
              </div>
            </form>
          </CardContent>
        </Card>
           <div className="text-center">
                  <Link href="/retour">
                    <Button className="btn-perso">Retour</Button>
                  </Link>
       </div>
      </div>
      
    </div>
  );
}
