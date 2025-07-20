import { useParams } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { useAuthContext } from '@/components/auth-provider';
import { Sidebar } from '@/components/sidebar';
import { UserManagement } from '@/components/user-management';
import { FileManagement } from '@/components/file-management';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  Home, 
  Users, 
  FileText, 
  Settings, 
  TrendingUp,
  Activity,
  Crown,
  Search
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { authManager } from '@/lib/auth';

// Page du dashboard administrateur avec gestion complète
export default function AdminDashboard() {
  const { user } = useAuthContext();
  const params = useParams();
  const section = params.section || 'home';

  // Redirection si pas admin
  if (user?.role !== 'admin') {
    window.location.href = '/dashboard';
    return null;
  }

  // Récupération des statistiques du dashboard
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['/api/stats/dashboard'],
    queryFn: async () => {
      const response = await authManager.authenticatedFetch('/api/stats/dashboard');
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des statistiques');
      }
      const data = await response.json();
      return data.stats;
    },
  });

  // Configuration des cartes de statistiques
  const statCards = [
    {
      title: 'Utilisateurs totaux',
      value: stats?.totalUsers || 0,
      icon: Users,
      color: 'blue',
      bgColor: 'bg-blue-100',
      iconColor: 'text-blue-600',
    },
    {
      title: 'Fichiers gérés',
      value: stats?.totalFiles || 0,
      icon: FileText,
      color: 'green',
      bgColor: 'bg-green-100',
      iconColor: 'text-green-600',
    },
    {
      title: 'Administrateurs',
      value: stats?.totalAdmins || 0,
      icon: Crown,
      color: 'yellow',
      bgColor: 'bg-yellow-100',
      iconColor: 'text-yellow-600',
    },
    {
      title: "Activités aujourd'hui",
      value: stats?.todayActivity || 0,
      icon: TrendingUp,
      color: 'purple',
      bgColor: 'bg-purple-100',
      iconColor: 'text-purple-600',
    },
  ];

  // Rendu du contenu selon la section active
  const renderContent = () => {
    switch (section) {
      case 'files':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <FileText className="w-6 h-6 text-primary" />
                <h1 className="text-2xl font-bold text-gray-900">Gestion des Fichiers</h1>
              </div>
            </div>
            <FileManagement />
          </div>
        );

      case 'users':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Users className="w-6 h-6 text-primary" />
                <h1 className="text-2xl font-bold text-gray-900">Gestion des Utilisateurs</h1>
              </div>
            </div>
            <UserManagement />
          </div>
        );

      case 'settings':
        return (
          <div className="space-y-6">
            <div className="flex items-center space-x-2">
              <Settings className="w-6 h-6 text-primary" />
              <h1 className="text-2xl font-bold text-gray-900">Paramètres du Système</h1>
            </div>
            <Card>
              <CardHeader>
                <CardTitle>Configuration générale</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      Nom de l'application
                    </label>
                    <Input 
                      defaultValue="Gestion Utilisateurs - Angenor Blami"
                      className="form-input"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      Email de contact
                    </label>
                    <Input 
                      defaultValue="angenor@email.com"
                      type="email"
                      className="form-input"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      Limite de fichiers par utilisateur
                    </label>
                    <Input 
                      defaultValue="50"
                      type="number"
                      className="form-input"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      Taille maximale de fichier (MB)
                    </label>
                    <Input 
                      defaultValue="10"
                      type="number"
                      className="form-input"
                    />
                  </div>
                </div>
                <div className="pt-4">
                  <Button className="btn-primary">
                    Sauvegarder les paramètres
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      default:
        return (
          <div className="space-y-6">
            {/* En-tête du dashboard */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center space-x-2">
                <Home className="w-6 h-6 text-primary" />
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    Dashboard Administrateur
                  </h1>
                  <p className="text-gray-600">
                    Vue d'ensemble du système et statistiques générales
                  </p>
                </div>
              </div>
              
              {/* Barre de recherche globale */}
              <div className="relative w-full sm:w-auto">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Rechercher..."
                  className="pl-10 w-full sm:w-64"
                />
              </div>
            </div>

            {/* Statistiques générales */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {statsLoading ? (
                // Skeleton pour les statistiques
                Array.from({ length: 4 }).map((_, index) => (
                  <Card key={index} className="stat-card">
                    <CardContent className="pt-6">
                      <div className="flex items-center">
                        <Skeleton className="h-12 w-12 rounded-lg" />
                        <div className="ml-4 flex-1">
                          <Skeleton className="h-6 w-16 mb-2" />
                          <Skeleton className="h-4 w-24" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                statCards.map((card, index) => {
                  const Icon = card.icon;
                  return (
                    <Card key={index} className="stat-card hover:shadow-lg transition-all duration-200">
                      <CardContent className="pt-6">
                        <div className="flex items-center">
                          <div className={`p-3 rounded-lg ${card.bgColor}`}>
                            <Icon className={`w-6 h-6 ${card.iconColor}`} />
                          </div>
                          <div className="ml-4">
                            <p className="text-2xl font-bold text-gray-900">
                              {card.value}
                            </p>
                            <p className="text-gray-600 text-sm">
                              {card.title}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </div>

            {/* Graphiques et activité récente */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Graphique d'activité */}
              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Activité des utilisateurs
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">
                        Graphique d'activité
                      </p>
                      <p className="text-sm text-gray-400 mt-2">
                        Intégration Chart.js à venir
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Activité récente */}
              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="w-5 h-5" />
                    Activité récente
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      {
                        type: 'user_created',
                        message: 'Nouvel utilisateur inscrit',
                        details: 'Marie Dubois',
                        time: 'il y a 5 min',
                        icon: Users,
                        color: 'bg-green-100 text-green-600'
                      },
                      {
                        type: 'file_uploaded',
                        message: 'Fichier téléchargé',
                        details: 'Rapport_Q1.pdf',
                        time: 'il y a 12 min',
                        icon: FileText,
                        color: 'bg-blue-100 text-blue-600'
                      },
                      {
                        type: 'user_updated',
                        message: 'Utilisateur modifié',
                        details: 'Jean Martin',
                        time: 'il y a 1h',
                        icon: Users,
                        color: 'bg-yellow-100 text-yellow-600'
                      }
                    ].map((activity, index) => {
                      const Icon = activity.icon;
                      return (
                        <div key={index} className="flex items-start space-x-3">
                          <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${activity.color}`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm text-gray-900">{activity.message}</p>
                            <p className="text-sm text-gray-600">{activity.details}</p>
                            <p className="text-xs text-gray-500">{activity.time}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar administrative */}
      <Sidebar isAdmin={true} />
      
      {/* Contenu principal */}
      <div className="flex-1 flex flex-col overflow-hidden md:ml-64">
        {/* Zone de contenu avec padding pour mobile */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 pt-16 md:pt-0 custom-scrollbar">
          <div className="p-6 max-w-7xl mx-auto">
            <div className="fade-in">
              {renderContent()}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
