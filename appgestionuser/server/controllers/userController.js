import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import db from '../config.js';

// Clé secrète pour JWT
const SECRET = process.env.JWT_SECRET || 'supersecret';

// Inscription d’un nouvel utilisateur
export const inscriptionUtilisateur = async (req, res) => {
  const { nom, prenoms, email, motDePasse, role } = req.body;

  if (!nom || !prenoms || !email || !motDePasse || !role) {
    return res.status(400).json({ message: 'Tous les champs sont requis.' });
  }

  try {
    // Vérifier si l’email existe déjà
    const utilisateurExistant = await db.query(
      'SELECT * FROM utilisateurs WHERE email = $1',
      [email]
    );

    if (utilisateurExistant.rows.length > 0) {
      return res.status(400).json({ message: 'Cet email est déjà utilisé.' });
    }

    // Hasher le mot de passe
    const hash = await bcrypt.hash(motDePasse, 10);

    // Insérer dans la base
    const resultat = await db.query(
      'INSERT INTO utilisateurs (nom, prenoms, email, mot_de_passe, role) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [nom, prenoms, email, hash, role]
    );

    res.status(201).json(resultat.rows[0]);
  } catch (erreur) {
    res.status(500).json({ message: 'Erreur serveur', erreur });
  }
};

// Connexion
export const connexionUtilisateur = async (req, res) => {
  const { email, motDePasse } = req.body;

  try {
    const resultat = await db.query(
      'SELECT * FROM utilisateurs WHERE email = $1',
      [email]
    );

    if (resultat.rows.length === 0) {
      return res.status(400).json({ message: 'Email incorrect.' });
    }

    const utilisateur = resultat.rows[0];

    const motDePasseValide = await bcrypt.compare(
      motDePasse,
      utilisateur.mot_de_passe
    );

    if (!motDePasseValide) {
      return res.status(401).json({ message: 'Mot de passe incorrect.' });
    }

    const token = jwt.sign(
      { id: utilisateur.id, role: utilisateur.role },
      SECRET,
      { expiresIn: '24h' }
    );

    res.json({ token });
  } catch (erreur) {
    res.status(500).json({ message: 'Erreur serveur', erreur });
  }
};

// Obtenir tous les utilisateurs
export const obtenirUtilisateurs = async (req, res) => {
  try {
    const resultat = await db.query('SELECT id, nom, prenoms, email, role FROM utilisateurs');
    res.json(resultat.rows);
  } catch (erreur) {
    res.status(500).json({ message: 'Erreur serveur', erreur });
  }
};

// Obtenir un utilisateur par ID
export const obtenirUtilisateurParId = async (req, res) => {
  const { id } = req.params;

  try {
    const resultat = await db.query(
      'SELECT id, nom, prenoms, email, role FROM utilisateurs WHERE id = $1',
      [id]
    );

    if (resultat.rows.length === 0) {
      return res.status(404).json({ message: 'Utilisateur non trouvé.' });
    }

    res.json(resultat.rows[0]);
  } catch (erreur) {
    res.status(500).json({ message: 'Erreur serveur', erreur });
  }
};

// Modifier un utilisateur
export const modifierUtilisateur = async (req, res) => {
  const { id } = req.params;
  const { nom, prenoms, email, role } = req.body;

  try {
    const resultat = await db.query(
      'UPDATE utilisateurs SET nom = $1, prenoms = $2, email = $3, role = $4 WHERE id = $5 RETURNING *',
      [nom, prenoms, email, role, id]
    );

    if (resultat.rows.length === 0) {
      return res.status(404).json({ message: 'Utilisateur non trouvé.' });
    }

    res.json(resultat.rows[0]);
  } catch (erreur) {
    res.status(500).json({ message: 'Erreur serveur', erreur });
  }
};

// Supprimer un utilisateur
export const supprimerUtilisateur = async (req, res) => {
  const { id } = req.params;

  try {
    const resultat = await db.query(
      'DELETE FROM utilisateurs WHERE id = $1 RETURNING *',
      [id]
    );

    if (resultat.rows.length === 0) {
      return res.status(404).json({ message: 'Utilisateur non trouvé.' });
    }

    res.json({ message: 'Utilisateur supprimé.' });
  } catch (erreur) {
    res.status(500).json({ message: 'Erreur serveur', erreur });
  }
};
