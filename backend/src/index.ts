import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import * as dotenv from 'dotenv';
import { Pool } from 'pg';

dotenv.config();

const app = (express as any).default ? (express as any).default() : express();
const PORT = process.env.PORT || 5000;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

app.use(helmet());
app.use(cors());
app.use(express.json());

const initDB = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS medical_records (
      id SERIAL PRIMARY KEY,
      medecin VARCHAR(255) NOT NULL,
      patient_nom VARCHAR(255),
      patient_id VARCHAR(255) NOT NULL,
      type_evenement VARCHAR(255) NOT NULL,
      hopital VARCHAR(255) NOT NULL,
      hash_bloc TEXT NOT NULL,
      timestamp TIMESTAMPTZ DEFAULT NOW()
    );
  `);
  console.log('✅ Table medical_records prête');
};

app.get('/', (req: Request, res: Response) => {
  res.json({ message: 'Medichain API en ligne 🚀' });
});

app.get('/api/records', async (req: Request, res: Response) => {
  try {
    const result = await pool.query('SELECT * FROM medical_records ORDER BY timestamp DESC');
    res.json(result.rows);
  } catch (err) {
    console.error('Erreur GET:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

app.post('/api/records', async (req: Request, res: Response) => {
  try {
    const { medecin, patient_nom, patient_id, type_evenement, hopital, hash_bloc } = req.body;
    const result = await pool.query(
      `INSERT INTO medical_records (medecin, patient_nom, patient_id, type_evenement, hopital, hash_bloc)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [medecin, patient_nom, patient_id, type_evenement, hopital, hash_bloc]
    );
    console.log('📥 Acte enregistré:', result.rows[0]);
    res.status(201).json({ success: true, record: result.rows[0] });
  } catch (err) {
    console.error('Erreur POST:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

app.listen(PORT, async () => {
  console.log(`✅ Serveur démarré sur http://localhost:${PORT}`);
  try {
    await initDB();
  } catch (err) {
    console.error('❌ Erreur DB:', err);
    process.exit(1);
  }
});