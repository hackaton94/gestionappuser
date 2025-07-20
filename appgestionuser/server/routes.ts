import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, loginSchema, insertFileSchema, type AuthResponse } from "@shared/schema";
import { z } from "zod";
import jwt from "jsonwebtoken";
import { AuthenticatedRequest, AuthenticatedRequestWithParams } from "./types";

// Secret JWT (en production, utiliser une variable d'environnement)
const JWT_SECRET = process.env.JWT_SECRET || "angenor-blami-user-management-secret-key";

// Middleware d'authentification JWT
const authenticateToken = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Token d'accès requis"
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: number; email: string };
    const user = await storage.getUser(decoded.userId);
    
    if (!user || !user.actif) {
      return res.status(401).json({
        success: false,
        message: "Token invalide ou utilisateur inactif"
      });
    }

    (req as AuthenticatedRequest).user = user;
    next();
  } catch (error) {
    return res.status(403).json({
      success: false,
      message: "Token invalide"
    });
  }
};

// Middleware pour vérifier les droits administrateur
const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  if ((req as AuthenticatedRequest).user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: "Accès réservé aux administrateurs"
    });
  }
  next();
};

export async function registerRoutes(app: Express): Promise<Server> {
  
  // === ROUTES D'AUTHENTIFICATION ===
  
  // POST /api/auth/register - Inscription d'un nouvel utilisateur
  app.post("/api/auth/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const user = await storage.createUser(userData);
      
      // Générer un token JWT
      const token = jwt.sign(
        { userId: user.id, email: user.email },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      // Retourner sans le mot de passe
      const { password, ...userWithoutPassword } = user;

      const response: AuthResponse = {
        success: true,
        message: "Compte créé avec succès",
        token,
        user: userWithoutPassword
      };

      res.status(201).json(response);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          message: "Données invalides",
          errors: error.errors.map(e => e.message)
        });
      }
      
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : "Erreur lors de la création du compte"
      });
    }
  });

  // POST /api/auth/login - Connexion utilisateur
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = loginSchema.parse(req.body);
      const user = await storage.authenticateUser(email, password);
      
      if (!user) {
        return res.status(401).json({
          success: false,
          message: "Email ou mot de passe incorrect"
        });
      }

      // Générer un token JWT
      const token = jwt.sign(
        { userId: user.id, email: user.email },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      // Retourner sans le mot de passe
      const { password: _, ...userWithoutPassword } = user;

      const response: AuthResponse = {
        success: true,
        message: "Connexion réussie",
        token,
        user: userWithoutPassword
      };

      res.json(response);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          message: "Données invalides",
          errors: error.errors.map(e => e.message)
        });
      }
      
      res.status(500).json({
        success: false,
        message: "Erreur serveur lors de la connexion"
      });
    }
  });

  // GET /api/auth/me - Obtenir les informations de l'utilisateur connecté
  app.get("/api/auth/me", authenticateToken, async (req, res) => {
    const { password, ...userWithoutPassword } = (req as AuthenticatedRequest).user;
    res.json({
      success: true,
      user: userWithoutPassword
    });
  });

  // === ROUTES UTILISATEURS ===

  // GET /api/users - Obtenir la liste des utilisateurs (Admin seulement)
  app.get("/api/users", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const search = req.query.search as string;
      const role = req.query.role as string;
      const actif = req.query.actif ? req.query.actif === 'true' : undefined;

      const { users, total } = await storage.getAllUsers({
        page,
        limit,
        search,
        role,
        actif
      });

      // Retirer les mots de passe de la réponse
      const usersWithoutPasswords = users.map(({ password, ...user }) => user);

      res.json({
        success: true,
        data: usersWithoutPasswords,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Erreur lors de la récupération des utilisateurs"
      });
    }
  });

  // GET /api/users/:id - Obtenir un utilisateur spécifique
  app.get("/api/users/:id", authenticateToken, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const user = await storage.getUser(id);
      
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "Utilisateur non trouvé"
        });
      }

      // Les utilisateurs simples ne peuvent voir que leur propre profil
      const currentUser = (req as AuthenticatedRequest).user;
      if (currentUser.role !== 'admin' && currentUser.id !== id) {
        return res.status(403).json({
          success: false,
          message: "Accès non autorisé"
        });
      }

      const { password, ...userWithoutPassword } = user;
      res.json({
        success: true,
        user: userWithoutPassword
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Erreur lors de la récupération de l'utilisateur"
      });
    }
  });

  // POST /api/users - Créer un nouvel utilisateur (Admin seulement)
  app.post("/api/users", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const user = await storage.createUser(userData);
      
      const { password, ...userWithoutPassword } = user;
      res.status(201).json({
        success: true,
        message: "Utilisateur créé avec succès",
        user: userWithoutPassword
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          message: "Données invalides",
          errors: error.errors.map(e => e.message)
        });
      }
      
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : "Erreur lors de la création de l'utilisateur"
      });
    }
  });

  // PUT /api/users/:id - Modifier un utilisateur
  app.put("/api/users/:id", authenticateToken, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      // Les utilisateurs simples ne peuvent modifier que leur propre profil
      const currentUser = (req as AuthenticatedRequest).user;
      if (currentUser.role !== 'admin' && currentUser.id !== id) {
        return res.status(403).json({
          success: false,
          message: "Accès non autorisé"
        });
      }

      const updates = req.body;
      
      // Les utilisateurs simples ne peuvent pas changer leur rôle
      if (currentUser.role !== 'admin' && updates.role) {
        delete updates.role;
      }

      const updatedUser = await storage.updateUser(id, updates);
      
      if (!updatedUser) {
        return res.status(404).json({
          success: false,
          message: "Utilisateur non trouvé"
        });
      }

      const { password, ...userWithoutPassword } = updatedUser;
      res.json({
        success: true,
        message: "Utilisateur modifié avec succès",
        user: userWithoutPassword
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Erreur lors de la modification de l'utilisateur"
      });
    }
  });

  // DELETE /api/users/:id - Supprimer un utilisateur
  app.delete("/api/users/:id", authenticateToken, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      // Les utilisateurs simples ne peuvent supprimer que leur propre compte
      const currentUser = (req as AuthenticatedRequest).user;
      if (currentUser.role !== 'admin' && currentUser.id !== id) {
        return res.status(403).json({
          success: false,
          message: "Accès non autorisé"
        });
      }

      const success = await storage.deleteUser(id);
      
      if (!success) {
        return res.status(404).json({
          success: false,
          message: "Utilisateur non trouvé"
        });
      }

      res.json({
        success: true,
        message: "Utilisateur supprimé avec succès"
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Erreur lors de la suppression de l'utilisateur"
      });
    }
  });

  // === ROUTES FICHIERS ===

  // GET /api/files - Obtenir la liste des fichiers
  app.get("/api/files", authenticateToken, async (req, res) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const search = req.query.search as string;
      const type = req.query.type as string;

      const { files, total } = await storage.getAllFiles({
        page,
        limit,
        search,
        type
      });

      res.json({
        success: true,
        data: files,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Erreur lors de la récupération des fichiers"
      });
    }
  });

  // GET /api/files/:id - Obtenir un fichier spécifique
  app.get("/api/files/:id", authenticateToken, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const file = await storage.getFile(id);
      
      if (!file) {
        return res.status(404).json({
          success: false,
          message: "Fichier non trouvé"
        });
      }

      res.json({
        success: true,
        file
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Erreur lors de la récupération du fichier"
      });
    }
  });

  // POST /api/files - Créer un nouveau fichier (Admin seulement)
  app.post("/api/files", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const fileData = { ...req.body, creeParId: (req as AuthenticatedRequest).user.id };
      const validatedData = insertFileSchema.parse(fileData);
      const file = await storage.createFile(validatedData);
      
      res.status(201).json({
        success: true,
        message: "Fichier ajouté avec succès",
        file
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          message: "Données invalides",
          errors: error.errors.map(e => e.message)
        });
      }
      
      res.status(500).json({
        success: false,
        message: "Erreur lors de l'ajout du fichier"
      });
    }
  });

  // PUT /api/files/:id - Modifier un fichier (Admin seulement)
  app.put("/api/files/:id", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updatedFile = await storage.updateFile(id, req.body);
      
      if (!updatedFile) {
        return res.status(404).json({
          success: false,
          message: "Fichier non trouvé"
        });
      }

      res.json({
        success: true,
        message: "Fichier modifié avec succès",
        file: updatedFile
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Erreur lors de la modification du fichier"
      });
    }
  });

  // DELETE /api/files/:id - Supprimer un fichier (Admin seulement)
  app.delete("/api/files/:id", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteFile(id);
      
      if (!success) {
        return res.status(404).json({
          success: false,
          message: "Fichier non trouvé"
        });
      }

      res.json({
        success: true,
        message: "Fichier supprimé avec succès"
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Erreur lors de la suppression du fichier"
      });
    }
  });

  // === ROUTES STATISTIQUES ===

  // GET /api/stats/dashboard - Statistiques du dashboard (Admin seulement)
  app.get("/api/stats/dashboard", authenticateToken, requireAdmin, async (req, res) => {
    try {
      const stats = await storage.getDashboardStats();
      res.json({
        success: true,
        stats
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Erreur lors de la récupération des statistiques"
      });
    }
  });

  // GET /api/stats/user - Statistiques utilisateur
  app.get("/api/stats/user", authenticateToken, async (req, res) => {
    try {
      const stats = await storage.getUserStats((req as AuthenticatedRequest).user.id);
      res.json({
        success: true,
        stats
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Erreur lors de la récupération des statistiques utilisateur"
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
