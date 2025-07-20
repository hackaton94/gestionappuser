import { type User, type AuthResponse, type LoginCredentials } from "@shared/schema";

// Classe pour gérer l'authentification côté client
export class AuthManager {
  private static instance: AuthManager;
  private currentUser: Omit<User, 'password'> | null = null;
  private token: string | null = null;

  private constructor() {
    // Charger les données d'authentification depuis le localStorage au démarrage
    this.loadFromStorage();
  }

  // Singleton pattern pour une seule instance d'AuthManager
  public static getInstance(): AuthManager {
    if (!AuthManager.instance) {
      AuthManager.instance = new AuthManager();
    }
    return AuthManager.instance;
  }

  // Charger les données d'authentification depuis le localStorage
  private loadFromStorage(): void {
    try {
      const savedToken = localStorage.getItem('auth_token');
      const savedUser = localStorage.getItem('auth_user');
      
      if (savedToken && savedUser) {
        this.token = savedToken;
        this.currentUser = JSON.parse(savedUser);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des données d\'authentification:', error);
      this.clearStorage();
    }
  }

  // Sauvegarder les données d'authentification dans le localStorage
  private saveToStorage(): void {
    if (this.token && this.currentUser) {
      localStorage.setItem('auth_token', this.token);
      localStorage.setItem('auth_user', JSON.stringify(this.currentUser));
    }
  }

  // Effacer les données d'authentification du localStorage
  private clearStorage(): void {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
  }

  // Connexion utilisateur
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      const data: AuthResponse = await response.json();

      if (data.success && data.token && data.user) {
        this.token = data.token;
        this.currentUser = data.user;
        this.saveToStorage();
      }

      return data;
    } catch (error) {
      return {
        success: false,
        message: 'Erreur de connexion au serveur',
      };
    }
  }

  // Inscription utilisateur
  async register(userData: any): Promise<AuthResponse> {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const data: AuthResponse = await response.json();

      if (data.success && data.token && data.user) {
        this.token = data.token;
        this.currentUser = data.user;
        this.saveToStorage();
      }

      return data;
    } catch (error) {
      return {
        success: false,
        message: 'Erreur de connexion au serveur',
      };
    }
  }

  // Déconnexion
  logout(): void {
    this.token = null;
    this.currentUser = null;
    this.clearStorage();
  }

  // Vérifier si l'utilisateur est connecté
  isAuthenticated(): boolean {
    return !!(this.token && this.currentUser);
  }

  // Obtenir l'utilisateur actuel
  getCurrentUser(): Omit<User, 'password'> | null {
    return this.currentUser;
  }

  // Obtenir le token d'authentification
  getToken(): string | null {
    return this.token;
  }

  // Vérifier si l'utilisateur est administrateur
  isAdmin(): boolean {
    return this.currentUser?.role === 'admin';
  }

  // Obtenir les en-têtes d'authentification pour les requêtes API
  getAuthHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    return headers;
  }

  // Faire une requête authentifiée
  async authenticatedFetch(url: string, options: RequestInit = {}): Promise<Response> {
    const headers = {
      ...this.getAuthHeaders(),
      ...options.headers,
    };

    return fetch(url, {
      ...options,
      headers,
    });
  }

  // Vérifier si le token est valide en faisant un appel à l'API
  async validateToken(): Promise<boolean> {
    if (!this.token) return false;

    try {
      const response = await this.authenticatedFetch('/api/auth/me');
      
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.user) {
          this.currentUser = data.user;
          this.saveToStorage();
          return true;
        }
      }

      // Token invalide, se déconnecter
      this.logout();
      return false;
    } catch (error) {
      console.error('Erreur lors de la validation du token:', error);
      this.logout();
      return false;
    }
  }

  // Mettre à jour les informations de l'utilisateur actuel
  updateCurrentUser(user: Omit<User, 'password'>): void {
    this.currentUser = user;
    this.saveToStorage();
  }
}

// Instance globale d'AuthManager
export const authManager = AuthManager.getInstance();

// Hook pour utiliser l'authentification dans les composants React
export function useAuth() {
  return {
    login: authManager.login.bind(authManager),
    register: authManager.register.bind(authManager),
    logout: authManager.logout.bind(authManager),
    isAuthenticated: authManager.isAuthenticated.bind(authManager),
    getCurrentUser: authManager.getCurrentUser.bind(authManager),
    isAdmin: authManager.isAdmin.bind(authManager),
    getAuthHeaders: authManager.getAuthHeaders.bind(authManager),
    authenticatedFetch: authManager.authenticatedFetch.bind(authManager),
    validateToken: authManager.validateToken.bind(authManager),
    updateCurrentUser: authManager.updateCurrentUser.bind(authManager),
  };
}
