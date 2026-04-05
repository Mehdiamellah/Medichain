// Simplified blockchain for browser (using Web Crypto API polyfill with SHA-256)

export interface Transaction {
  transaction_id: string;
  medecin: string;
  patient_id: string;
  type_evenement: string;
  hopital: string;
  hash_donnees: string;
  signature: string;
  timestamp: string;
}

export interface Block {
  index: number;
  timestamp: string;
  type_evenement: string;
  medecin: string;
  patient_id: string;
  hopital: string;
  hash_donnees: string;
  signature: string;
  transaction_id: string;
  hash_precedent: string;
  hash_bloc: string;
}

export interface ValidationEntry {
  index: number;
  hash_valide: boolean;
  lien_valide: boolean;
  signature_valide: boolean;
  erreurs: string[];
}

export interface Stats {
  total_blocs: number;
  transactions: number;
  patients_uniques: number;
  hopitaux: string[];
  types: Record<string, number>;
}

// Simple SHA-256 using SubtleCrypto
async function sha256(message: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

// Sync SHA-256 fallback (simple hash for demo)
function sha256Sync(message: string): string {
  let hash = 0;
  for (let i = 0; i < message.length; i++) {
    const char = message.charCodeAt(i);
    hash = ((hash << 5) - hash + char) | 0;
  }
  // Create a deterministic 64-char hex string
  const base = Math.abs(hash).toString(16).padStart(8, "0");
  let result = "";
  for (let i = 0; i < 8; i++) {
    const segment = base.split("").reverse().join("") + i.toString();
    let h = 0;
    for (let j = 0; j < segment.length; j++) {
      h = ((h << 5) - h + segment.charCodeAt(j)) | 0;
    }
    result += Math.abs(h).toString(16).padStart(8, "0");
  }
  return result.slice(0, 64);
}

function generateId(): string {
  return crypto.randomUUID?.() ?? Date.now().toString(36) + Math.random().toString(36).slice(2);
}

export function generatePatientId(name: string): string {
  const normalized = name.trim().toLowerCase().replace(/\s+/g, "_");
  return "PAT_" + sha256Sync(normalized).slice(0, 12).toUpperCase();
}

// Simulated RSA signature (for demo - produces a deterministic hex string)
function simulateSignature(data: string, doctorName: string): string {
  const combined = data + "|" + doctorName + "|private_key";
  return "RSA_SIG_" + sha256Sync(combined);
}

function verifySignature(data: string, signature: string, doctorName: string): boolean {
  const expected = simulateSignature(data, doctorName);
  return signature === expected;
}

function computeBlockHash(block: Omit<Block, "hash_bloc">): string {
  const content = `${block.index}|${block.timestamp}|${block.hash_precedent}|${block.hash_donnees}|${block.signature}|${block.transaction_id}`;
  return sha256Sync(content);
}

const STORAGE_KEY = "medichain_blockchain";

export class Blockchain {
  chain: Block[];

  constructor() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        this.chain = JSON.parse(saved);
        return;
      } catch {
        // fall through to genesis
      }
    }
    this.chain = [this.createGenesis()];
    this.save();
  }

  private createGenesis(): Block {
    const block: Block = {
      index: 0,
      timestamp: new Date().toISOString(),
      type_evenement: "genesis",
      medecin: "Système",
      patient_id: "",
      hopital: "",
      hash_donnees: sha256Sync("genesis_block"),
      signature: "",
      transaction_id: "genesis",
      hash_precedent: "0".repeat(64),
      hash_bloc: "",
    };
    block.hash_bloc = computeBlockHash(block);
    return block;
  }

  private save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.chain));
  }

  reload() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      this.chain = JSON.parse(saved);
    }
  }

  addTransaction(tx: {
    medecin: string;
    patient_id: string;
    type_evenement: string;
    hopital: string;
    description: string;
  }): Block {
    const lastBlock = this.chain[this.chain.length - 1];
    const hashDonnees = sha256Sync(tx.description);
    const signature = simulateSignature(hashDonnees, tx.medecin);
    const transactionId = generateId();

    const block: Block = {
      index: lastBlock.index + 1,
      timestamp: new Date().toISOString(),
      type_evenement: tx.type_evenement,
      medecin: tx.medecin,
      patient_id: tx.patient_id,
      hopital: tx.hopital,
      hash_donnees: hashDonnees,
      signature,
      transaction_id: transactionId,
      hash_precedent: lastBlock.hash_bloc,
      hash_bloc: "",
    };
    block.hash_bloc = computeBlockHash(block);
    this.chain.push(block);
    this.save();
    return block;
  }

  getPatientHistory(patientId: string): Block[] {
    return this.chain.filter(
      (b) => b.patient_id === patientId && b.type_evenement !== "genesis"
    );
  }

  getStats(): Stats {
    const medical = this.chain.filter((b) => b.type_evenement !== "genesis");
    const patients = new Set(medical.map((b) => b.patient_id));
    const hopitaux = [...new Set(medical.map((b) => b.hopital))];
    const types: Record<string, number> = {};
    medical.forEach((b) => {
      types[b.type_evenement] = (types[b.type_evenement] || 0) + 1;
    });
    return {
      total_blocs: this.chain.length,
      transactions: medical.length,
      patients_uniques: patients.size,
      hopitaux,
      types,
    };
  }

  validateChain(): { valid: boolean; report: ValidationEntry[] } {
    const report: ValidationEntry[] = [];
    let allValid = true;

    for (let i = 0; i < this.chain.length; i++) {
      const block = this.chain[i];
      const erreurs: string[] = [];

      // Check hash
      const expectedHash = computeBlockHash(block);
      const hashValide = expectedHash === block.hash_bloc;
      if (!hashValide) {
        erreurs.push(`Hash bloc invalide (attendu: ${expectedHash.slice(0, 16)}..., stocké: ${block.hash_bloc.slice(0, 16)}...)`);
      }

      // Check link
      let lienValide = true;
      if (i > 0) {
        lienValide = block.hash_precedent === this.chain[i - 1].hash_bloc;
        if (!lienValide) {
          erreurs.push("Lien avec le bloc précédent rompu");
        }
      }

      // Check signature
      let signatureValide = true;
      if (block.type_evenement !== "genesis") {
        signatureValide = verifySignature(block.hash_donnees, block.signature, block.medecin);
        if (!signatureValide) {
          erreurs.push("Signature RSA invalide — identité du médecin non vérifiable");
        }
      }

      if (erreurs.length > 0) allValid = false;
      report.push({
        index: i,
        hash_valide: hashValide,
        lien_valide: lienValide,
        signature_valide: signatureValide,
        erreurs,
      });
    }

    return { valid: allValid, report };
  }

  tamperBlock(blockIndex: number, field: string, value: string) {
    if (blockIndex >= 0 && blockIndex < this.chain.length) {
      (this.chain[blockIndex] as any)[field] = value;
      this.save();
    }
  }

  reset() {
    this.chain = [this.createGenesis()];
    this.save();
  }
}

export const HOPITAUX = [
  "CHU Ibn Sina — Rabat",
  "CHU Ibn Rochd — Casablanca",
  "CHU Mohamed VI — Marrakech",
  "Hôpital Moulay Ismail — Meknès",
  "CHU Hassan II — Fès",
];

export const TYPES_EVENEMENTS = [
  "Consultation",
  "Ordonnance",
  "Analyse biologique",
  "Imagerie médicale",
  "Hospitalisation",
  "Intervention chirurgicale",
  "Vaccination",
  "Urgence",
];
