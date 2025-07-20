import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { type User } from '@shared/schema';
import { authManager } from '@/lib/auth';

// Contexte d'authentification pour partager l'état dans toute l'application
interface AuthContextType {
  user: Omit<User, 'password'> | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message: string }>;
  register: (userData: any) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
  isAdmin: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider d'authentification pour encapsuler l'application
interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<Omit<User, 'password'> | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Vérifier l'authentification au chargement de l'application
  useEffect(() => {
    const initAuth = async () => {
      setIsLoading(true);
      
      // Vérifier si un token existe et est valide
      const isValid = await authManager.validateToken();
      
      if (isValid) {
        const currentUser = authManager.getCurrentUser();
        setUser(currentUser);
      }
      
      setIsLoading(false);
    };

    initAuth();
  }, []);

  // Fonction de connexion
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await authManager.login({ email, password });
      
      if (response.success && response.user) {
        setUser(response.user);
        return { success: true, message: response.message };
      }
      
      return { success: false, message: response.message };
    } catch (error) {
      return { success: false, message: 'Erreur de connexion' };
    } finally {
      setIsLoading(false);
    }
  };

  // Fonction d'inscription
  const register = async (userData: any) => {
    setIsLoading(true);
    try {
      const response = await authManager.register(userData);
      
      if (response.success && response.user) {
        setUser(response.user);
        return { success: true, message: response.message };
      }
      
      return { success: false, message: response.message };
    } catch (error) {
      return { success: false, message: 'Erreur lors de l\'inscription' };
    } finally {
      setIsLoading(false);
    }
  };

  // Fonction de déconnexion
  const logout = () => {
    authManager.logout();
    setUser(null);
  };

  // Vérifier si l'utilisateur est administrateur
  const isAdmin = () => {
    return user?.role === 'admin';
  };

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
    isAdmin,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook pour utiliser le contexte d'authentification
export function useAuthContext() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext doit être utilisé dans un AuthProvider');
  }
  return context;
}
