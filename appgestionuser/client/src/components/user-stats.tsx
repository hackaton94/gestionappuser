import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { FileText, Eye, Calendar, TrendingUp } from 'lucide-react';
import { Skeleton } from './ui/skeleton';
import { authManager } from '@/lib/auth';

// Composant pour afficher les statistiques utilisateur avec des cartes modernes
export function UserStats() {
  // Récupération des statistiques utilisateur via React Query
  const { data: stats, isLoading, error } = useQuery({
    queryKey: ['/api/stats/user'],
    queryFn: async () => {
      const response = await authManager.authenticatedFetch('/api/stats/user');
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des statistiques');
      }
      const data = await response.json();
      return data.stats;
    },
  });

  // Affichage du skeleton pendant le chargement
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {[...Array(3)].map((_, index) => (
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
        ))}
      </div>
    );
  }

  // Affichage en cas d'erreur
  if (error) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="col-span-full">
          <CardContent className="pt-6">
            <p className="text-red-600 text-center">
              Erreur lors du chargement des statistiques
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Configuration des cartes de statistiques
  const statCards = [
    {
      title: 'Fichiers accessibles',
      value: stats?.filesCount || 0,
      icon: FileText,
      color: 'blue',
      bgColor: 'bg-blue-100',
      iconColor: 'text-blue-600',
    },
    {
      title: 'Fichiers consultés',
      value: stats?.viewsCount || 0,
      icon: Eye,
      color: 'green',
      bgColor: 'bg-green-100',
      iconColor: 'text-green-600',
    },
    {
      title: 'Dernière connexion',
      value: stats?.lastLogin || 'Jamais',
      icon: Calendar,
      color: 'purple',
      bgColor: 'bg-purple-100',
      iconColor: 'text-purple-600',
      isText: true,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 fade-in">
      {statCards.map((card, index) => {
        const Icon = card.icon;
        return (
          <Card key={index} className="stat-card hover:shadow-lg transition-all duration-200">
            <CardContent className="pt-6">
              <div className="flex items-center">
                <div className={`p-3 rounded-lg ${card.bgColor}`}>
                  <Icon className={`w-6 h-6 ${card.iconColor}`} />
                </div>
                <div className="ml-4">
                  <p className={`text-2xl font-bold text-gray-900 ${card.isText ? 'text-base' : ''}`}>
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
      })}
    </div>
  );
}
