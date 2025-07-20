import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Table des utilisateurs - Gère les comptes utilisateurs avec leurs rôles
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  nom: text("nom").notNull(), // Nom de famille de l'utilisateur
  prenoms: text("prenoms").notNull(), // Prénoms de l'utilisateur
  email: text("email").notNull().unique(), // Email unique pour la connexion
  password: text("password").notNull(), // Mot de passe hashé
  role: text("role").notNull().default("user"), // 'admin' ou 'user'
  actif: boolean("actif").notNull().default(true), // Statut actif/inactif
  dateCreation: timestamp("date_creation").defaultNow().notNull(), // Date de création du compte
  derniereConnexion: timestamp("derniere_connexion"), // Dernière fois connecté
});

// Table des fichiers - Gère les fichiers uploadés dans le système
export const files = pgTable("files", {
  id: serial("id").primaryKey(),
  nom: text("nom").notNull(), // Nom du fichier
  description: text("description"), // Description optionnelle du fichier
  type: text("type").notNull(), // Type MIME du fichier (pdf, docx, etc.)
  taille: integer("taille").notNull(), // Taille en octets
  cheminFichier: text("chemin_fichier").notNull(), // Chemin de stockage du fichier
  creeParId: integer("cree_par_id").references(() => users.id).notNull(), // Qui a créé le fichier
  dateCreation: timestamp("date_creation").defaultNow().notNull(),
  dateModification: timestamp("date_modification").defaultNow().notNull(),
});

// Schémas de validation pour l'inscription d'un utilisateur
export const insertUserSchema = createInsertSchema(users).pick({
  nom: true,
  prenoms: true,
  email: true,
  password: true,
  role: true,
}).extend({
  // Validation stricte pour l'email
  email: z.string().email("Format d'email invalide"),
  // Validation du mot de passe avec critères de sécurité
  password: z.string().min(6, "Le mot de passe doit contenir au moins 6 caractères"),
  // Validation du rôle
  role: z.enum(["admin", "user"], {
    errorMap: () => ({ message: "Le rôle doit être 'admin' ou 'user'" })
  }),
});

// Schéma pour la connexion (seulement email et mot de passe)
export const loginSchema = z.object({
  email: z.string().email("Format d'email invalide"),
  password: z.string().min(1, "Le mot de passe est requis"),
});

// Schéma pour l'ajout/modification de fichiers
export const insertFileSchema = createInsertSchema(files).pick({
  nom: true,
  description: true,
  type: true,
  taille: true,
  cheminFichier: true,
  creeParId: true,
}).extend({
  nom: z.string().min(1, "Le nom du fichier est requis"),
  type: z.string().min(1, "Le type de fichier est requis"),
  taille: z.number().positive("La taille doit être positive"),
});

// Types TypeScript générés automatiquement
export type InsertUser = z.infer<typeof insertUserSchema>;
export type LoginCredentials = z.infer<typeof loginSchema>;
export type InsertFile = z.infer<typeof insertFileSchema>;
export type User = typeof users.$inferSelect;
export type File = typeof files.$inferSelect;

// Type pour les réponses d'authentification
export type AuthResponse = {
  success: boolean;
  message: string;
  token?: string;
  user?: Omit<User, 'password'>; // Utilisateur sans mot de passe
};

// Type pour les statistiques du dashboard
export type DashboardStats = {
  totalUsers: number;
  totalFiles: number;
  totalAdmins: number;
  todayActivity: number;
};

// Type pour les statistiques utilisateur
export type UserStats = {
  filesCount: number;
  viewsCount: number;
  lastLogin: string;
};
