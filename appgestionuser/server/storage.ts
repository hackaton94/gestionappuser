import { users, files, type User, type File, type InsertUser, type InsertFile, type DashboardStats, type UserStats } from "@shared/schema";
import bcrypt from "bcryptjs";

// Interface de stockage étendue pour la gestion complète des utilisateurs et fichiers
export interface IStorage {
  // === GESTION DES UTILISATEURS ===
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<Omit<User, 'id' | 'dateCreation'>>): Promise<User | undefined>;
  deleteUser(id: number): Promise<boolean>;
  getAllUsers(options?: {
    page?: number;
    limit?: number;
    search?: string;
    role?: string;
    actif?: boolean;
  }): Promise<{ users: User[]; total: number }>;
  
  // === GESTION DES FICHIERS ===
  getFile(id: number): Promise<File | undefined>;
  createFile(file: InsertFile): Promise<File>;
  updateFile(id: number, updates: Partial<Omit<File, 'id' | 'dateCreation'>>): Promise<File | undefined>;
  deleteFile(id: number): Promise<boolean>;
  getAllFiles(options?: {
    page?: number;
    limit?: number;
    search?: string;
    type?: string;
  }): Promise<{ files: File[]; total: number }>;
  getFilesByUser(userId: number): Promise<File[]>;
  
  // === AUTHENTIFICATION ===
  authenticateUser(email: string, password: string): Promise<User | null>;
  updateLastLogin(userId: number): Promise<void>;
  
  // === STATISTIQUES ===
  getDashboardStats(): Promise<DashboardStats>;
  getUserStats(userId: number): Promise<UserStats>;
}

// Implémentation en mémoire pour le développement et la démonstration
export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private files: Map<number, File>;
  private currentUserId: number;
  private currentFileId: number;

  constructor() {
    this.users = new Map();
    this.files = new Map();
    this.currentUserId = 1;
    this.currentFileId = 1;
    
    // Initialiser avec des données par défaut pour Angenor Blami
    this.initializeDefaultData();
  }

  // Initialise l'application avec des données par défaut
  private async initializeDefaultData() {
    // Créer le compte administrateur d'Angenor Blami
    const hashedPassword = await bcrypt.hash("admin123", 12);
    const adminUser: User = {
      id: this.currentUserId++,
      nom: "Blami",
      prenoms: "Angenor",
      email: "angenor@email.com",
      password: hashedPassword,
      role: "admin",
      actif: true,
      dateCreation: new Date(),
      derniereConnexion: new Date(),
    };
    this.users.set(adminUser.id, adminUser);

    // Créer quelques utilisateurs de test
    const testUsers = [
      { nom: "Dubois", prenoms: "Marie", email: "marie.dubois@email.com", role: "user" },
      { nom: "Martin", prenoms: "Jean", email: "jean.martin@email.com", role: "user" },
      { nom: "Dupont", prenoms: "Pierre", email: "pierre.dupont@email.com", role: "admin" },
    ];

    for (const userData of testUsers) {
      const hashedPwd = await bcrypt.hash("password123", 12);
      const user: User = {
        id: this.currentUserId++,
        ...userData,
        password: hashedPwd,
        actif: true,
        dateCreation: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000), // Dates aléatoires dans les 30 derniers jours
        derniereConnexion: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000), // Connexions dans les 7 derniers jours
      };
      this.users.set(user.id, user);
    }

    // Créer quelques fichiers de test
    const testFiles = [
      { nom: "Rapport_annuel_2024.pdf", description: "Rapport financier complet", type: "application/pdf", taille: 3355443 },
      { nom: "Budget_2024.xlsx", description: "Prévisions budgétaires", type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", taille: 1887436 },
      { nom: "Guide_utilisateur.docx", description: "Manuel d'utilisation", type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document", taille: 1258291 },
      { nom: "Presentation_projet.pptx", description: "Présentation du nouveau projet", type: "application/vnd.openxmlformats-officedocument.presentationml.presentation", taille: 5242880 },
    ];

    for (const fileData of testFiles) {
      const file: File = {
        id: this.currentFileId++,
        ...fileData,
        cheminFichier: `/uploads/${fileData.nom.replace(/\s+/g, '_').toLowerCase()}`,
        creeParId: adminUser.id,
        dateCreation: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
        dateModification: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
      };
      this.files.set(file.id, file);
    }
  }

  // === IMPLÉMENTATION DES MÉTHODES UTILISATEURS ===

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    // Vérifier si l'email existe déjà
    const existingUser = await this.getUserByEmail(insertUser.email);
    if (existingUser) {
      throw new Error("Un utilisateur avec cet email existe déjà");
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(insertUser.password, 12);
    
    const user: User = {
      id: this.currentUserId++,
      nom: insertUser.nom,
      prenoms: insertUser.prenoms,
      email: insertUser.email,
      password: hashedPassword,
      role: insertUser.role,
      actif: true,
      dateCreation: new Date(),
      derniereConnexion: null,
    };
    
    this.users.set(user.id, user);
    return user;
  }

  async updateUser(id: number, updates: Partial<Omit<User, 'id' | 'dateCreation'>>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;

    // Si le mot de passe est modifié, le hasher
    if (updates.password) {
      updates.password = await bcrypt.hash(updates.password, 12);
    }

    const updatedUser = { ...user, ...updates };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async deleteUser(id: number): Promise<boolean> {
    return this.users.delete(id);
  }

  async getAllUsers(options: {
    page?: number;
    limit?: number;
    search?: string;
    role?: string;
    actif?: boolean;
  } = {}): Promise<{ users: User[]; total: number }> {
    let userList = Array.from(this.users.values());

    // Filtrage par recherche (nom, prénoms, email)
    if (options.search) {
      const searchLower = options.search.toLowerCase();
      userList = userList.filter(user => 
        user.nom.toLowerCase().includes(searchLower) ||
        user.prenoms.toLowerCase().includes(searchLower) ||
        user.email.toLowerCase().includes(searchLower)
      );
    }

    // Filtrage par rôle
    if (options.role) {
      userList = userList.filter(user => user.role === options.role);
    }

    // Filtrage par statut actif
    if (options.actif !== undefined) {
      userList = userList.filter(user => user.actif === options.actif);
    }

    const total = userList.length;

    // Pagination
    if (options.page && options.limit) {
      const startIndex = (options.page - 1) * options.limit;
      userList = userList.slice(startIndex, startIndex + options.limit);
    }

    // Trier par date de création (plus récent en premier)
    userList.sort((a, b) => b.dateCreation.getTime() - a.dateCreation.getTime());

    return { users: userList, total };
  }

  // === IMPLÉMENTATION DES MÉTHODES FICHIERS ===

  async getFile(id: number): Promise<File | undefined> {
    return this.files.get(id);
  }

  async createFile(insertFile: InsertFile): Promise<File> {
    const file: File = {
      id: this.currentFileId++,
      nom: insertFile.nom,
      description: insertFile.description || null,
      type: insertFile.type,
      taille: insertFile.taille,
      cheminFichier: insertFile.cheminFichier,
      creeParId: insertFile.creeParId,
      dateCreation: new Date(),
      dateModification: new Date(),
    };
    
    this.files.set(file.id, file);
    return file;
  }

  async updateFile(id: number, updates: Partial<Omit<File, 'id' | 'dateCreation'>>): Promise<File | undefined> {
    const file = this.files.get(id);
    if (!file) return undefined;

    const updatedFile = { 
      ...file, 
      ...updates, 
      dateModification: new Date() 
    };
    this.files.set(id, updatedFile);
    return updatedFile;
  }

  async deleteFile(id: number): Promise<boolean> {
    return this.files.delete(id);
  }

  async getAllFiles(options: {
    page?: number;
    limit?: number;
    search?: string;
    type?: string;
  } = {}): Promise<{ files: File[]; total: number }> {
    let fileList = Array.from(this.files.values());

    // Filtrage par recherche (nom)
    if (options.search) {
      const searchLower = options.search.toLowerCase();
      fileList = fileList.filter(file => 
        file.nom.toLowerCase().includes(searchLower)
      );
    }

    // Filtrage par type
    if (options.type) {
      fileList = fileList.filter(file => file.type.includes(options.type!));
    }

    const total = fileList.length;

    // Pagination
    if (options.page && options.limit) {
      const startIndex = (options.page - 1) * options.limit;
      fileList = fileList.slice(startIndex, startIndex + options.limit);
    }

    // Trier par date de modification (plus récent en premier)
    fileList.sort((a, b) => b.dateModification.getTime() - a.dateModification.getTime());

    return { files: fileList, total };
  }

  async getFilesByUser(userId: number): Promise<File[]> {
    return Array.from(this.files.values()).filter(file => file.creeParId === userId);
  }

  // === IMPLÉMENTATION DE L'AUTHENTIFICATION ===

  async authenticateUser(email: string, password: string): Promise<User | null> {
    const user = await this.getUserByEmail(email);
    if (!user || !user.actif) {
      return null;
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return null;
    }

    // Mettre à jour la dernière connexion
    await this.updateLastLogin(user.id);
    return user;
  }

  async updateLastLogin(userId: number): Promise<void> {
    const user = this.users.get(userId);
    if (user) {
      user.derniereConnexion = new Date();
      this.users.set(userId, user);
    }
  }

  // === IMPLÉMENTATION DES STATISTIQUES ===

  async getDashboardStats(): Promise<DashboardStats> {
    const userList = Array.from(this.users.values());
    const fileList = Array.from(this.files.values());
    
    const totalUsers = userList.length;
    const totalAdmins = userList.filter(user => user.role === 'admin').length;
    const totalFiles = fileList.length;
    
    // Simuler l'activité d'aujourd'hui (connexions + fichiers créés)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayLogins = userList.filter(user => 
      user.derniereConnexion && user.derniereConnexion >= today
    ).length;
    
    const todayFiles = fileList.filter(file => 
      file.dateCreation >= today
    ).length;
    
    const todayActivity = todayLogins + todayFiles;

    return {
      totalUsers,
      totalFiles,
      totalAdmins,
      todayActivity,
    };
  }

  async getUserStats(userId: number): Promise<UserStats> {
    const userFiles = await this.getFilesByUser(userId);
    const user = await this.getUser(userId);
    
    return {
      filesCount: userFiles.length,
      viewsCount: userFiles.length * Math.floor(Math.random() * 10) + 1, // Simulation des vues
      lastLogin: user?.derniereConnexion ? this.formatRelativeTime(user.derniereConnexion) : "Jamais",
    };
  }

  // Méthode utilitaire pour formater les dates relatives
  private formatRelativeTime(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffHours < 1) return "À l'instant";
    if (diffHours < 24) return `Il y a ${diffHours}h`;
    if (diffDays === 1) return "Hier";
    if (diffDays < 30) return `Il y a ${diffDays} jours`;
    return date.toLocaleDateString('fr-FR');
  }
}

// Instance globale de stockage
export const storage = new MemStorage();
