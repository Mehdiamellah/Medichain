import { useState } from "react";
import { useBlockchain } from "@/hooks/useBlockchain";
import { generatePatientId } from "@/lib/blockchain";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FileText, Building2, Stethoscope } from "lucide-react";

export default function PatientHistory() {
  const { getPatientHistory } = useBlockchain();
  const [patient, setPatient] = useState("");

  const patientId = patient.trim() ? generatePatientId(patient) : "";
  const history = patientId ? getPatientHistory(patientId) : [];
  const hopitaux = new Set(history.map((b) => b.hopital));
  const medecins = new Set(history.map((b) => b.medecin));

  return (
    <div className="animate-fade-in">
      <div className="bg-primary rounded-xl p-7 mb-6">
        <h1 className="text-2xl font-bold text-primary-foreground tracking-tight">Historique médical</h1>
        <p className="text-primary-foreground/70 text-sm mt-1">
          Consultez l'ensemble des actes d'un patient sur tout le réseau hospitalier
        </p>
      </div>

      <div className="bg-card rounded-xl p-5 border border-border shadow-sm mb-6">
        <Label>Nom du patient</Label>
        <div className="flex gap-4 items-end">
          <div className="flex-1">
            <Input
              placeholder="Ex : Mohamed Khalil"
              value={patient}
              onChange={(e) => setPatient(e.target.value)}
            />
          </div>
          {patientId && (
            <div className="text-xs text-muted-foreground font-mono shrink-0">
              ID : {patientId}
            </div>
          )}
        </div>
      </div>

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

      {!patient.trim() && (
        <div className="bg-card rounded-xl p-6 border border-border text-center text-sm text-muted-foreground">
          Saisissez le nom du patient pour afficher son historique.
        </div>
      )}

      {patient.trim() && history.length === 0 && (
        <div className="bg-accent/50 border border-border rounded-lg p-4 text-sm text-muted-foreground">
          Aucun acte trouvé pour {patient} (ID : {patientId}).
        </div>
      )}

      {history.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Chronologie médicale</h2>
          {history.map((bloc) => (
            <details
              key={bloc.index}
              className="bg-card rounded-xl border border-border shadow-sm group"
            >
              <summary className="p-4 cursor-pointer flex items-center gap-2 flex-wrap text-sm hover:bg-muted/30 rounded-xl transition-colors">
                <span className="bg-primary text-primary-foreground text-xs font-bold px-2 py-0.5 rounded-md">
                  #{bloc.index}
                </span>
                <span className="font-medium text-card-foreground">{bloc.type_evenement}</span>
                <span className="text-muted-foreground">·</span>
                <span className="text-muted-foreground">{bloc.timestamp.slice(0, 10)}</span>
                <span className="text-muted-foreground">·</span>
                <span className="text-muted-foreground">{bloc.hopital}</span>
              </summary>
              <div className="px-4 pb-4 pt-1 border-t border-border">
                <div className="grid sm:grid-cols-2 gap-3 text-sm mb-3">
                  <div><span className="text-muted-foreground">Médecin :</span> <span className="text-card-foreground font-medium">{bloc.medecin}</span></div>
                  <div><span className="text-muted-foreground">Établissement :</span> <span className="text-card-foreground font-medium">{bloc.hopital}</span></div>
                  <div><span className="text-muted-foreground">Type d'acte :</span> <span className="text-card-foreground font-medium">{bloc.type_evenement}</span></div>
                  <div><span className="text-muted-foreground">Date :</span> <span className="text-card-foreground font-medium">{bloc.timestamp.slice(0, 19).replace("T", " ")}</span></div>
                </div>
                <div className="space-y-2">
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Empreinte SHA-256 des données :</div>
                    <code className="block bg-muted text-xs font-mono text-muted-foreground rounded px-3 py-2 break-all">{bloc.hash_donnees}</code>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Signature RSA :</div>
                    <code className="block bg-muted text-xs font-mono text-muted-foreground rounded px-3 py-2 break-all">{bloc.signature.slice(0, 80)}...</code>
                  </div>
                </div>
              </div>
            </details>
          ))}
        </div>
      )}
    </div>
  );
}
