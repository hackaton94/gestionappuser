// src/config/db.js

import pkg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false, // Important pour Render
  }
});

pool.connect()
  .then(() => {
    console.log('Connexion à la base de données PostgreSQL réussie.');
  })
  .catch((err) => {
    console.error('Erreur de connexion à PostgreSQL:', err);
  });

export default pool;
