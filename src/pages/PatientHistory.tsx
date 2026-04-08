import { useState, useEffect } from "react";
import { generatePatientId } from "@/lib/blockchain";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FileText, Building2, Stethoscope, Loader2, Search } from "lucide-react";

export default function PatientHistory() {
  const [patient, setPatient] = useState("");
  const [allRecords, setAllRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // 1. Récupération des données depuis le serveur Node.js
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/records");
        const data = await response.json();
        setAllRecords(data);
      } catch (error) {
        console.error("Erreur Backend:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const patientId = patient.trim() ? generatePatientId(patient) : "";

  // 2. Filtrage des données reçues du serveur
  const history = allRecords.filter(record => record.patient_id === patientId);
  
  const hopitaux = new Set(history.map((b) => b.hopital));
  const medecins = new Set(history.map((b) => b.medecin));

  return (
    <div className="animate-fade-in">
      <div className="bg-primary rounded-xl p-7 mb-6">
        <h1 className="text-2xl font-bold text-primary-foreground tracking-tight">Historique médical</h1>
        <p className="text-primary-foreground/70 text-sm mt-1">
          Registre centralisé — Données synchronisées avec le serveur Medichain
        </p>
      </div>

      <div className="bg-card rounded-xl p-5 border border-border shadow-sm mb-6">
        <Label className="flex items-center gap-2 mb-2">
          <Search className="w-4 h-4" /> Rechercher un patient
        </Label>
        <div className="flex gap-4 items-end">
          <div className="flex-1">
            <Input
              placeholder="Saisissez le nom complet pour générer l'ID"
              value={patient}
              onChange={(e) => setPatient(e.target.value)}
            />
          </div>
          {patientId && (
            <div className="text-xs text-muted-foreground font-mono bg-muted px-2 py-1 rounded border">
              ID : {patientId}
            </div>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
          <Loader2 className="w-8 h-8 animate-spin mb-2" />
          <p>Synchronisation avec le registre central...</p>
        </div>
      ) : (
        <>
          {patient.trim() && (
            <div className="grid grid-cols-3 gap-4 mb-6">
              {[
                { icon: FileText, value: history.length, label: "Actes enregistrés" },
                { icon: Building2, value: hopitaux.size, label: "Établissements" },
                { icon: Stethoscope, value: medecins.size, label: "Médecins" },
              ].map((s) => (
                <div key={s.label} className="bg-card rounded-xl p-4 border-l-4 border-l-primary shadow-sm">
                  <div className="text-2xl font-bold text-primary">{s.value}</div>
                  <div className="text-[11px] uppercase tracking-wider text-muted-foreground">{s.label}</div>
                </div>
              ))}
            </div>
          )}

          {patient.trim() && history.length === 0 && (
            <div className="bg-accent/50 border border-border rounded-lg p-6 text-center text-sm text-muted-foreground">
              Aucun acte trouvé pour cet identifiant dans la base de données.
            </div>
          )}

          {history.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Actes certifiés par le serveur</h2>
              {history.map((bloc, index) => (
                <details key={index} className="bg-card rounded-xl border border-border shadow-sm group overflow-hidden">
                  <summary className="p-4 cursor-pointer flex items-center gap-3 text-sm hover:bg-muted/30 transition-colors">
                    <span className="bg-primary/10 text-primary text-[10px] font-bold px-2 py-1 rounded uppercase">
                      Acte #{index + 1}
                    </span>
                    <span className="font-semibold text-card-foreground">{bloc.type_evenement}</span>
                    <span className="text-muted-foreground ml-auto text-xs">{bloc.timestamp?.slice(0, 10)}</span>
                  </summary>
                  <div className="px-4 pb-4 pt-2 border-t border-border bg-muted/10">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <p><span className="text-muted-foreground">Médecin :</span> <br/><b>{bloc.medecin}</b></p>
                      <p><span className="text-muted-foreground">Hôpital :</span> <br/><b>{bloc.hopital}</b></p>
                      <p className="col-span-2"><span className="text-muted-foreground">Empreinte numérique (Hash) :</span><br/>
                        <code className="text-[10px] break-all bg-muted p-1 rounded block mt-1">{bloc.hash_bloc}</code>
                      </p>
                    </div>
                  </div>
                </details>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}