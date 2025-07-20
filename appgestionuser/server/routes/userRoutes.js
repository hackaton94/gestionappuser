import express from 'express';
import {
  inscriptionUtilisateur,
  connexionUtilisateur,
  obtenirUtilisateurs,
  obtenirUtilisateurParId,
  modifierUtilisateur,
  supprimerUtilisateur
} from '../controllers/userController.js';
import { verifierToken } from '../middlewares/auth.js';

const routeur = express.Router();

// Inscription
routeur.post('/inscription', inscriptionUtilisateur);

// Connexion
routeur.post('/connexion', connexionUtilisateur);

// Routes protégées
routeur.get('/utilisateurs', verifierToken, obtenirUtilisateurs);
routeur.get('/utilisateurs/:id', verifierToken, obtenirUtilisateurParId);
routeur.put('/utilisateurs/:id', verifierToken, modifierUtilisateur);
routeur.delete('/utilisateurs/:id', verifierToken, supprimerUtilisateur);

export default routeur;
