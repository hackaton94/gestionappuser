
import pkg from 'pg';
import bcrypt from 'bcrypt';
import pool from '../config/db.js';

const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});
//models/userModel.js
export const ajouterUtilisateur = async (utilisateur) => {
  const { nom, prenoms, email, mot_de_passe, role } = utilisateur;
  const result = await pool.query(
    'INSERT INTO utilisateurs (nom, prenoms, email, mot_de_passe, role) VALUES ($1, $2, $3, $4, $5) RETURNING *',
    [nom, prenoms, email, mot_de_passe, role]
  );
  return result.rows[0];
};

// Fonction pour créer un utilisateur
export async function creerUtilisateur(nom, email, motDePasse, role) {
  const motDePasseHash = await bcrypt.hash(motDePasse, 10);
  const resultat = await pool.query(
    'INSERT INTO utilisateurs (nom, email, mot_de_passe, role) VALUES ($1, $2, $3, $4) RETURNING *',
    [nom, email, motDePasseHash, role]
  );
  return resultat.rows[0];
}

// Fonction pour trouver un utilisateur par email
export async function trouverUtilisateurParEmail(email) {
  const resultat = await pool.query('SELECT * FROM utilisateurs WHERE email = $1', [email]);
  return resultat.rows[0];
}

// Fonction pour trouver un utilisateur par ID
export async function trouverUtilisateurParId(id) {
  const resultat = await pool.query('SELECT * FROM utilisateurs WHERE id = $1', [id]);
  return resultat.rows[0];
}

// Fonction pour récupérer tous les utilisateurs
export async function recupererTousLesUtilisateurs() {
  const resultat = await pool.query('SELECT * FROM utilisateurs');
  return resultat.rows;
}

// Fonction pour modifier un utilisateur
export async function modifierUtilisateur(id, nom, email, role) {
  const resultat = await pool.query(
    'UPDATE utilisateurs SET nom = $1, email = $2, role = $3 WHERE id = $4 RETURNING *',
    [nom, email, role, id]
  );
  return resultat.rows[0];
}

// Fonction pour supprimer un utilisateur
export async function supprimerUtilisateur(id) {
  await pool.query('DELETE FROM utilisateurs WHERE id = $1', [id]);
  return { message: 'Utilisateur supprimé avec succès' };
}
