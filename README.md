# Système de Gestion des Utilisateurs - Angenor Blami

Une application web moderne et responsive pour la gestion complète des utilisateurs et des fichiers, développée avec React et TypeScript.


Le projet est organisé comme ceci :

```
appgestionuser/
├── client/                    # Frontend (Interface utilisateur)
│   ├── src/
│   │   ├── components/        # Composants réutilisables (boutons, modals, etc.)
│   │   ├── pages/            # Pages de l'application (login, dashboard, etc.)
│   │   ├── hooks/            # Fonctions personnalisées React
│   │   ├── lib/              # Utilitaires et configuration
│   │   ├── App.tsx           # Composant principal
│   │   ├── main.tsx          # Point d'entrée
│   │   └── index.css         # Styles globaux
│   └── index.html            # Page HTML principale
├── server/                   # Backend (Serveur et API)       
├── shared/                   # Code partagé frontend/backend
│   └── schema.ts             # Définition des données (utilisateurs, fichiers)
├── package.json              # Dépendances et scripts
├── tailwind.config.ts        # Configuration des styles
├── README.md                 # Documentation en français
└── API_GUIDE.md              # Guide pour connecter une vraie base de données
```

##  Fonctionnalités

### Authentification Sécurisée
- **Inscription** : Formulaire complet avec nom, prénoms, email, mot de passe et sélection de rôle
- **Connexion** : Authentification sécurisée via JWT
- **Gestion des sessions** : Tokens JWT avec validation côté serveur
- **Validation des formulaires** : Validation côté client et serveur avec Zod

### Deux Niveaux d'Accès

####  Utilisateur Simple
- **Dashboard personnel** avec statistiques individuelles
- **Accès en lecture seule** aux fichiers
- **Consultation et téléchargement** de fichiers autorisés
- **Gestion de profil** (déconnexion, suppression de compte)
- **Interface intuitive** avec sidebar de navigation

####  Administrateur
- **Dashboard administrateur** avec statistiques système complètes
- **Gestion des utilisateurs** : CRUD complet (Créer, Lire, Modifier, Supprimer)
- **Gestion des fichiers** : Upload, modification, suppression et organisation
- **Recherche et filtres** avancés pour utilisateurs et fichiers
- **Pagination** pour les grandes listes de données
- **Paramètres système** et configuration globale

### Interface Utilisateur Moderne
- **Design responsive** : Optimisé pour mobile et desktop
- **Thème violet/bleu** professionnel inspiré des plateformes modernes
- **Sidebar de navigation** contextuelle selon le rôle
- **Animations fluides** et transitions CSS
- **Cards et modals** pour une expérience utilisateur optimale
- **Skeleton loading** et gestion d'erreurs avancée

##  Technologies Utilisées

### Frontend
- **React 18** avec TypeScript pour une application robuste
- **Vite** pour un développement rapide et optimisé
- **Tailwind CSS** pour un styling moderne et responsive
- **Shadcn/UI** pour des composants UI élégants et accessibles
- **TanStack Query** pour la gestion des données et du cache
- **React Hook Form** avec validation Zod pour les formulaires
- **Wouter** pour le routing côté client
- **Lucide React** pour les icônes

### Backend
- **Node.js + Express** pour l'API REST
- **JWT** pour l'authentification sécurisée
- **bcrypt** pour le hashage des mots de passe
- **TypeScript** pour la sécurité des types
- **Render + Pgadmin** pour la base de données Render et l'hébergement 

### Base de Données
- **Stockage en mémoire** pour le développement (facilement remplaçable)
- **Interface IStorage** abstraite pour flexibilité
- **Support PostgreSQL+ Render +Pgadmin** 

##  Installation

### Prérequis
- Node.js 18+ et npm
- Git pour cloner le repository

### Étapes d'installation

1. **Cloner le repository**
```bash
git clone <url-du-repository>
cd gestion-utilisateurs-angenor-blami


Ce guide vous explique comment modifier et personnaliser votre application de gestion des utilisateurs.
Basé sur la documentation officielle de React et des technologies utilisées.

