CREATE TABLE IF NOT EXISTS medical_records (
  id SERIAL PRIMARY KEY,
  medecin VARCHAR(255) NOT NULL,
  patient_nom VARCHAR(255) NOT NULL,
  patient_id VARCHAR(255) NOT NULL,
  type_evenement VARCHAR(255) NOT NULL,
  hopital VARCHAR(255) NOT NULL,
  hash_bloc TEXT NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);