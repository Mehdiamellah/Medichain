import { useState } from "react";
import { useBlockchain } from "@/hooks/useBlockchain";
import { generatePatientId, HOPITAUX, TYPES_EVENEMENTS } from "@/lib/blockchain";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Hash, KeyRound, Link, Shield, CheckCircle2 } from "lucide-react";

export default function RegisterAct() {
  const { addTransaction } = useBlockchain();
  const [medecin, setMedecin] = useState("");
  const [patient, setPatient] = useState("");
  const [hopital, setHopital] = useState("");
  const [customHopital, setCustomHopital] = useState("");
  const [typeEvt, setTypeEvt] = useState("");
  const [description, setDescription] = useState("");
  const [errors, setErrors] = useState<string[]>([]);
  const [result, setResult] = useState<any>(null);

  const patientId = patient.trim() ? generatePatientId(patient) : "";
  const hopitalFinal = hopital === "other" ? customHopital : hopital;

const handleSubmit = async () => {
    const errs: string[] = [];
    if (!medecin.trim()) errs.push("Le nom du médecin est obligatoire.");
    if (!patient.trim()) errs.push("Le nom du patient est obligatoire.");
    if (!hopitalFinal?.trim()) errs.push("L'établissement est obligatoire.");
    if (!typeEvt) errs.push("Le type d'acte est obligatoire.");
    if (!description.trim()) errs.push("La description est obligatoire.");
    setErrors(errs);
    if (errs.length > 0) return;

    const block = addTransaction({
      medecin: medecin.trim(),
      patient_id: patientId,
      type_evenement: typeEvt,
      hopital: hopitalFinal.trim(),
      description: description.trim(),
    });

    console.log("BLOCK REÇU:", block);

    try {
      await fetch("https://medichain-d365.onrender.com", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          medecin: medecin.trim(),
          patient_id: patientId,
          patient_nom: patient.trim(),
          type_evenement: typeEvt,
          hopital: hopitalFinal.trim(),
          hash_bloc: block.hash_bloc,
        }),
      });
      console.log("✅ Envoyé au backend");
    } catch (error) {
      console.error("❌ Erreur:", error);
    }

    setResult(block);
    setMedecin("");
    setPatient("");
    setHopital("");
    setCustomHopital("");
    setTypeEvt("");
    setDescription("");
  };

  return (
    <div className="animate-fade-in">
      <div className="bg-primary rounded-xl p-7 mb-6">
        <h1 className="text-2xl font-bold text-primary-foreground tracking-tight">Enregistrer un acte médical</h1>
        <p className="text-primary-foreground/70 text-sm mt-1">
          La description reste hors chaîne (RGPD) — seule son empreinte SHA-256 est signée et enregistrée
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Form */}
        <div className="lg:col-span-2 space-y-5">
          {errors.length > 0 && (
            <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4 space-y-1">
              {errors.map((e, i) => (
                <p key={i} className="text-sm text-destructive font-medium">{e}</p>
              ))}
            </div>
          )}

          {result && (
            <div className="bg-secondary border border-primary/20 rounded-lg p-5">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle2 className="w-5 h-5 text-primary" />
                <span className="font-semibold text-primary">Bloc #{result.index} enregistré avec succès</span>
              </div>
              <div className="font-mono text-xs text-muted-foreground bg-muted rounded px-3 py-2">
                Hash bloc : {result.hash_bloc}
              </div>
            </div>
          )}

          <div className="bg-card rounded-xl p-6 border border-border shadow-sm space-y-4">
            <div>
              <Label>Nom du médecin signataire</Label>
              <Input
                placeholder="Ex : Dr. Sara Bennani"
                value={medecin}
                onChange={(e) => setMedecin(e.target.value)}
              />
            </div>

            <div>
              <Label>Nom complet du patient</Label>
              <Input
                placeholder="Ex : Mohamed Khalil"
                value={patient}
                onChange={(e) => setPatient(e.target.value)}
              />
              {patientId && (
                <p className="text-xs text-muted-foreground mt-1">
                  Identifiant anonymisé : <span className="font-mono">{patientId}</span>
                </p>
              )}
            </div>

            <div>
              <Label>Établissement émetteur</Label>
              <Select value={hopital} onValueChange={setHopital}>
                <SelectTrigger>
                  <SelectValue placeholder="Choisir un établissement" />
                </SelectTrigger>
                <SelectContent>
                  {HOPITAUX.map((h) => (
                    <SelectItem key={h} value={h}>{h}</SelectItem>
                  ))}
                  <SelectItem value="other">Autre (saisir ci-dessous)</SelectItem>
                </SelectContent>
              </Select>
              {hopital === "other" && (
                <Input
                  className="mt-2"
                  placeholder="Nom de l'établissement"
                  value={customHopital}
                  onChange={(e) => setCustomHopital(e.target.value)}
                />
              )}
            </div>

            <div>
              <Label>Type d'acte médical</Label>
              <Select value={typeEvt} onValueChange={setTypeEvt}>
                <SelectTrigger>
                  <SelectValue placeholder="Choisir un type" />
                </SelectTrigger>
                <SelectContent>
                  {TYPES_EVENEMENTS.map((t) => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Description médicale (restera hors chaîne)</Label>
              <Textarea
                placeholder="Ex : Consultation de suivi pour hypertension artérielle..."
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="bg-accent/50 border border-border rounded-lg p-3 text-xs text-muted-foreground">
              Seule l'empreinte SHA-256 de cette description sera stockée sur la blockchain.
              Le texte original ne quitte jamais ce formulaire — conformité RGPD garantie.
            </div>

            <Button onClick={handleSubmit} className="w-full">
              Signer et ajouter à la chaîne
            </Button>
          </div>
        </div>

        {/* Info panel */}
        <div className="bg-card rounded-xl p-6 border border-border shadow-sm h-fit">
          <h2 className="font-bold text-card-foreground mb-4">Comment ça fonctionne</h2>
          <div className="space-y-5">
            {[
              { icon: Hash, title: "1. Hachage SHA-256", desc: "La description est transformée en une empreinte de 64 caractères." },
              { icon: KeyRound, title: "2. Signature RSA", desc: "Le médecin signe le hash avec sa clé privée. N'importe qui peut vérifier." },
              { icon: Link, title: "3. Chaînage", desc: "Le nouveau bloc contient le hash du bloc précédent. Modifier un ancien bloc casse toute la chaîne." },
              { icon: Shield, title: "4. Conformité RGPD", desc: "Les données brutes restent locales. Seules les empreintes vont sur la blockchain." },
            ].map((step) => (
              <div key={step.title} className="flex gap-3">
                <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                  <step.icon className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-card-foreground">{step.title}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{step.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
