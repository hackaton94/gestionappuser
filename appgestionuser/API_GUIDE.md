# Guide API pour Gestion des Utilisateurs - Angenor Blami

Ce guide explique comment intégrer l'API backend avec une base de données réelle pour remplacer le stockage en mémoire actuel.

##  Vue d'ensemble

L'application utilise actuellement un stockage en mémoire (`MemStorage`) qui peut facilement être remplacé par une base de données réelle via l'interface `IStorage`.

##  Architecture de l'API

### Endpoints Disponibles

####  Authentification

| Méthode | Endpoint | Description | Auth |
|---------|----------|-------------|------|
| POST | `/api/auth/register` | Inscription utilisateur | Non |
| POST | `/api/auth/login` | Connexion utilisateur | Non |
| GET | `/api/auth/me` | Profil utilisateur | Oui|

####  Gestion des Utilisateurs

| Méthode | Endpoint | Description | Auth | Admin |
|---------|----------|-------------|------|-------|
| GET | `/api/users` | Liste des utilisateurs | Oui | Oui |
| GET | `/api/users/:id` | Détails utilisateur | Oui | Non* |
| POST | `/api/users` | Créer utilisateur | Oui | Oui |
| PUT | `/api/users/:id` | Modifier utilisateur | Oui | Non* |
| DELETE | `/api/users/:id` | Supprimer utilisateur | Oui | Non* |

*_Les utilisateurs peuvent accéder à leurs propres données_

####  Gestion des Fichiers

| Méthode | Endpoint | Description | Auth | Admin |
|---------|----------|-------------|------|-------|
| GET | `/api/files` | Liste des fichiers | Oui | Non |
| GET | `/api/files/:id` | Détails fichier | Oui | Non |
| POST | `/api/files` | Créer fichier | Oui | Oui |
| PUT | `/api/files/:id` | Modifier fichier | Oui | Oui |
| DELETE | `/api/files/:id` | Supprimer fichier | Oui | Oui |

####  Statistiques

| Méthode | Endpoint | Description | Auth | Admin |
|---------|----------|-------------|------|-------|
| GET | `/api/stats/dashboard` | Stats admin | Oui | Oui |
| GET | `/api/stats/user` | Stats utilisateur | Oui | Non |

##  Structure de Base de Données

### Table `users`

```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    nom VARCHAR(100) NOT NULL,
    prenoms VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(10) DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    actif BOOLEAN DEFAULT true,
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    derniere_connexion TIMESTAMP
);
