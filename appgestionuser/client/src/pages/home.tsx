import { Link } from 'wouter';
import { useAuthContext } from '@/components/auth-provider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Users, 
  Shield, 
  FileText, 
  Settings, 
  ArrowRight,
  CheckCircle
} from 'lucide-react';

// Page d'accueil publique avec présentation de l'application
export default function Home() {
  const { isAuthenticated, isAdmin } = useAuthContext();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-white">
      {/* En-tête de navigation */}
      <nav className="bg-white/80 backdrop-blur-sm shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo et titre */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">
                  Gestion Utilisateurs
                </h1>
                <p className="text-xs text-gray-500">par Angenor Blami</p>
              </div>
            </div>

            {/* Boutons de navigation */}
            <div className="flex items-center space-x-4">
              {isAuthenticated ? (
                <Link href={isAdmin() ? "/admin" : "/dashboard"}>
                  <Button className="btn-primary">
                    Accéder au Dashboard
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </Link>
              ) : (
                <div className="flex space-x-3">
                  <Link href="/login">
                    <Button variant="outline">Se connecter</Button>
                  </Link>
                  <Link href="/register">
                    <Button className="btn-primary">S'inscrire</Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Section héro */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-8 fade-in">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-primary rounded-full shadow-lg mb-6">
              <Users className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Système de Gestion
              <span className="block text-primary">des Utilisateurs</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Application moderne et responsive pour la gestion complète des utilisateurs 
              et des fichiers avec interface d'administration avancée.
            </p>
          </div>

          {/* Boutons d'action */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            {!isAuthenticated && (
              <>
                <Link href="/register">
                  <Button size="lg" className="btn-primary text-lg px-8 py-3">
                    Commencer maintenant
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
                <Link href="/login">
                  <Button size="lg" variant="outline" className="text-lg px-8 py-3">
                    Se connecter
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Section fonctionnalités */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Fonctionnalités principales
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Une solution complète avec deux niveaux d'accès pour une gestion 
              optimale des utilisateurs et des fichiers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Authentification */}
            <Card className="hover:shadow-lg transition-all duration-200 border-0 shadow-md">
              <CardHeader>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <Shield className="w-6 h-6 text-blue-600" />
                </div>
                <CardTitle>Authentification sécurisée</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Système d'authentification JWT avec inscription et connexion sécurisées.
                </p>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    Validation des formulaires
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    Gestion des sessions
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    Sécurité renforcée
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Gestion utilisateurs */}
            <Card className="hover:shadow-lg transition-all duration-200 border-0 shadow-md">
              <CardHeader>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                  <Users className="w-6 h-6 text-green-600" />
                </div>
                <CardTitle>Gestion des utilisateurs</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Interface complète pour la gestion des comptes utilisateurs avec recherche et filtres.
                </p>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    CRUD complet
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    Recherche avancée
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    Gestion des rôles
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Gestion fichiers */}
            <Card className="hover:shadow-lg transition-all duration-200 border-0 shadow-md">
              <CardHeader>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                  <FileText className="w-6 h-6 text-purple-600" />
                </div>
                <CardTitle>Gestion des fichiers</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Système de gestion de fichiers avec permissions selon les rôles utilisateur.
                </p>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    Upload sécurisé
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    Accès contrôlé
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    Organisation simple
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Section rôles */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Deux niveaux d'accès
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              L'application propose deux types de comptes adaptés aux besoins différents.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Utilisateur simple */}
            <Card className="p-8 hover:shadow-lg transition-all duration-200 border-0 shadow-md">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Users className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  Utilisateur Simple
                </h3>
                <p className="text-gray-600 mb-6">
                  Accès en lecture seule aux fichiers avec interface personnalisée
                </p>
                <ul className="text-left space-y-3 text-gray-600">
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                    Consultation des fichiers
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                    Téléchargement autorisé
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                    Statistiques personnelles
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                    Gestion de profil
                  </li>
                </ul>
              </div>
            </Card>

            {/* Administrateur */}
            <Card className="p-8 hover:shadow-lg transition-all duration-200 border-0 shadow-md bg-gradient-to-br from-yellow-50 to-orange-50">
              <div className="text-center">
                <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Settings className="w-8 h-8 text-yellow-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  Administrateur
                </h3>
                <p className="text-gray-600 mb-6">
                  Accès complet avec dashboard avancé et outils de gestion
                </p>
                <ul className="text-left space-y-3 text-gray-600">
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                    Gestion complète des utilisateurs
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                    CRUD fichiers avancé
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                    Statistiques système
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                    Paramètres globaux
                  </li>
                </ul>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                  <Users className="w-4 h-4 text-white" />
                </div>
                <h3 className="text-lg font-bold">Gestion Utilisateurs</h3>
              </div>
              <p className="text-gray-400">
                Solution moderne de gestion des utilisateurs et fichiers 
                développée par Angenor Blami.
              </p>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">Technologies</h4>
              <ul className="space-y-2 text-gray-400">
                <li>React 18 + TypeScript</li>
                <li>Tailwind CSS + Shadcn/UI</li>
                <li>TanStack Query</li>
                <li>JWT Authentication</li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">Fonctionnalités</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Interface responsive</li>
                <li>Authentification sécurisée</li>
                <li>Gestion de rôles</li>
                <li>Dashboard analytics</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center">
            <p className="text-gray-400">
              © 2025 Angenor Blami. Application développée pour la gestion moderne des utilisateurs.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
