import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { 
  Home, 
  FileText, 
  Users, 
  Settings, 
  LogOut, 
  Trash2, 
  Crown,
  User,
  Menu,
  X
} from 'lucide-react';
import { useAuthContext } from './auth-provider';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from './ui/alert-dialog';

// Composant Sidebar moderne inspiré des designs fournis
interface SidebarProps {
  isAdmin?: boolean;
}

export function Sidebar({ isAdmin = false }: SidebarProps) {
  const { user, logout } = useAuthContext();
  const [location] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Configuration des éléments de navigation selon le rôle
  const navigationItems = isAdmin ? [
    { href: '/admin', icon: Home, label: 'Tableau de bord', exact: true },
    { href: '/admin/files', icon: FileText, label: 'Gestion Fichiers' },
    { href: '/admin/users', icon: Users, label: 'Gestion Utilisateurs' },
    { href: '/admin/settings', icon: Settings, label: 'Paramètres' },
  ] : [
    { href: '/dashboard', icon: Home, label: 'Tableau de bord', exact: true },
    { href: '/dashboard/files', icon: FileText, label: 'Mes fichiers' },
    { href: '/dashboard/profile', icon: User, label: 'Mon profil' },
  ];

  // Vérifier si un lien est actif
  const isActiveLink = (href: string, exact = false) => {
    if (exact) {
      return location === href;
    }
    return location.startsWith(href);
  };

  // Gestionnaire de suppression de compte
  const handleDeleteAccount = async () => {
    try {
      const response = await fetch(`/api/users/${user?.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
      });

      if (response.ok) {
        logout();
      } else {
        console.error('Erreur lors de la suppression du compte');
      }
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const SidebarContent = () => (
    <div className="sidebar h-full">
      {/* En-tête avec informations utilisateur */}
      <div className="sidebar-header">
        <div className="flex items-center space-x-3">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
            isAdmin ? 'bg-yellow-100' : 'bg-primary'
          }`}>
            {isAdmin ? (
              <Crown className="w-5 h-5 text-yellow-600" />
            ) : (
              <User className="w-5 h-5 text-white" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {user?.prenoms} {user?.nom}
            </p>
            <p className="text-xs text-gray-500">
              {isAdmin ? 'Administrateur' : 'Utilisateur'}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation principale */}
      <nav className="sidebar-nav">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = isActiveLink(item.href, item.exact);
          
          return (
            <Link key={item.href} href={item.href}>
              <div 
                className={`nav-item ${isActive ? 'active' : ''}`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Icon className="w-5 h-5 mr-3" />
                {item.label}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Actions utilisateur en bas */}
      <div className="sidebar-footer">
        {/* Bouton de suppression de compte */}
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="outline" className="w-full justify-start" size="sm">
              <Trash2 className="w-4 h-4 mr-2" />
              Supprimer compte
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Supprimer votre compte</AlertDialogTitle>
              <AlertDialogDescription>
                Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible et supprimera toutes vos données.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Annuler</AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleDeleteAccount}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Supprimer définitivement
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Bouton de déconnexion */}
        <Button 
          variant="ghost" 
          className="w-full justify-start" 
          size="sm"
          onClick={logout}
        >
          <LogOut className="w-4 h-4 mr-2" />
          Se déconnecter
        </Button>
      </div>
    </div>
  );

  return (
    <>
      {/* Bouton menu mobile */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsMobileMenuOpen(true)}
          className="bg-white"
        >
          <Menu className="w-4 h-4" />
        </Button>
      </div>

      {/* Sidebar desktop */}
      <div className="hidden md:block w-64 h-screen fixed left-0 top-0">
        <SidebarContent />
      </div>

      {/* Overlay mobile */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-black bg-opacity-50">
          <div className="fixed inset-y-0 left-0 w-64 bg-white">
            <div className="absolute top-4 right-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            <SidebarContent />
          </div>
        </div>
      )}
    </>
  );
}
