import { useParams } from 'wouter';
import { useAuthContext } from '@/components/auth-provider';
import { Sidebar } from '@/components/sidebar';
import { UserStats } from '@/components/user-stats';
import { FileList } from '@/components/file-list';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Home, FileText, User } from 'lucide-react';

// Page du dashboard utilisateur avec navigation par sections
export default function UserDashboard() {
  const { user } = useAuthContext();
  const params = useParams();
  const section = params.section || 'home';

  // Si l'utilisateur est admin, rediriger vers le dashboard admin
  if (user?.role === 'admin') {
    window.location.href = '/admin';
    return null;
  }

  // Rendu du contenu selon la section active
  const renderContent = () => {
    switch (section) {
      case 'files':
        return (
          <div className="space-y-6">
            <div className="flex items-center space-x-2">
              <FileText className="w-6 h-6 text-primary" />
              <h1 className="text-2xl font-bold text-gray-900">Mes Fichiers</h1>
            </div>
            <FileList isReadOnly={true} />
          </div>
        );

      case 'profile':
        return (
          <div className="space-y-6">
            <div className="flex items-center space-x-2">
              <User className="w-6 h-6 text-primary" />
              <h1 className="text-2xl font-bold text-gray-900">Mon Profil</h1>
            </div>
            <Card>
              <CardHeader>
                <CardTitle>Informations personnelles</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Nom</label>
                    <p className="text-lg text-gray-900">{user?.nom}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Prénoms</label>
                    <p className="text-lg text-gray-900">{user?.prenoms}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Email</label>
                    <p className="text-lg text-gray-900">{user?.email}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Rôle</label>
                    <p className="text-lg text-gray-900">Utilisateur</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Statut</label>
                    <p className="text-lg text-green-600">
                      {user?.actif ? 'Actif' : 'Inactif'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Membre depuis</label>
                    <p className="text-lg text-gray-900">
                      {user?.dateCreation ? new Date(user.dateCreation).toLocaleDateString('fr-FR') : 'N/A'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      default:
        return (
          <div className="space-y-6">
            {/* En-tête de bienvenue */}
            <div className="flex items-center space-x-2 mb-8">
              <Home className="w-6 h-6 text-primary" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Bonjour, {user?.prenoms} ! 👋
                </h1>
                <p className="text-gray-600">
                  Voici un aperçu de vos fichiers et activités récentes.
                </p>
              </div>
            </div>

            {/* Statistiques utilisateur */}
            <UserStats />

            {/* Liste des fichiers récents */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900">
                Fichiers récents
              </h2>
              <FileList isReadOnly={true} />
            </div>
          </div>
        );
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar de navigation */}
      <Sidebar isAdmin={false} />
      
      {/* Contenu principal */}
      <div className="flex-1 flex flex-col overflow-hidden md:ml-64">
        {/* Zone de contenu avec padding pour mobile */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 pt-16 md:pt-0">
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
