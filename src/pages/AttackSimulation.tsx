import { useState } from "react";
import { useBlockchain } from "@/hooks/useBlockchain";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Zap, XCircle, AlertTriangle } from "lucide-react";

export default function AttackSimulation() {
  const { chain, tamperBlock, validateChain } = useBlockchain();
  const [targetIndex, setTargetIndex] = useState<string>("");
  const [targetField, setTargetField] = useState("hash_donnees");
  const [tampered, setTampered] = useState(false);
  const [result, setResult] = useState<ReturnType<typeof validateChain> | null>(null);

  const medicalBlocks = chain.filter((b) => b.type_evenement !== "genesis");

  const handleTamper = () => {
    const idx = parseInt(targetIndex);
    if (isNaN(idx)) return;
    tamperBlock(idx, targetField, `FALSIFICATION_${Date.now()}`);
    setTampered(true);
    setResult(null);
  };

  const handleDetect = () => {
    setResult(validateChain());
    setTampered(false);
  };

  return (
    <div className="animate-fade-in">
      <div className="bg-primary rounded-xl p-7 mb-6">
        <h1 className="text-2xl font-bold text-primary-foreground tracking-tight">Simulation d'attaque</h1>
        <p className="text-primary-foreground/70 text-sm mt-1">
          Démonstration pédagogique : falsification d'un bloc et détection par la blockchain
        </p>
      </div>

      <div className="bg-accent/50 border border-border rounded-lg p-4 mb-6 text-sm text-muted-foreground">
        <AlertTriangle className="w-4 h-4 inline mr-2 text-warning" />
        Cette section est destinée à la démonstration. Elle simule une modification directe pour prouver que
        MediChain détecte immédiatement toute falsification.
      </div>

      {medicalBlocks.length === 0 ? (
        <div className="bg-card rounded-xl p-6 border border-border text-center text-sm text-muted-foreground">
          Ajoutez d'abord des actes médicaux avant de simuler une attaque.
        </div>
      ) : (
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Config */}
          <div className="space-y-6">
            <div className="bg-card rounded-xl p-6 border border-border shadow-sm space-y-4">
              <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                Configuration de l'attaque
              </h2>

              <div>
                <Label>Bloc cible</Label>
                <Select value={targetIndex} onValueChange={setTargetIndex}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choisir un bloc" />
                  </SelectTrigger>
                  <SelectContent>
                    {medicalBlocks.map((b) => (
                      <SelectItem key={b.index} value={b.index.toString()}>
                        Bloc #{b.index} — {b.type_evenement} — {b.patient_id}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Champ à falsifier</Label>
                <Select value={targetField} onValueChange={setTargetField}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {["hash_donnees", "patient_id", "medecin", "type_evenement"].map((f) => (
                      <SelectItem key={f} value={f}>{f}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3 pt-2">
                <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                  Étape 1 — Injecter la falsification
                </div>
                <Button
                  variant="destructive"
                  className="w-full"
                  onClick={handleTamper}
                  disabled={!targetIndex}
                >
                  <Zap className="w-4 h-4 mr-2" />
                  Falsifier le bloc
                </Button>

                {tampered && (
                  <>
                    <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-3 text-xs text-destructive font-medium">
                      Bloc #{targetIndex} modifié — champ « {targetField} » écrasé
                    </div>
                    <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                      Étape 2 — Lancer la détection
                    </div>
                    <Button className="w-full" onClick={handleDetect}>
                      Vérifier et détecter la fraude
                    </Button>
                  </>
                )}

                {result && !result.valid && (
                  <div className="space-y-2">
                    <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4 flex items-center gap-2">
                      <XCircle className="w-5 h-5 text-destructive shrink-0" />
                      <span className="text-sm font-semibold text-destructive">
                        Falsification détectée sur {result.report.filter((r) => r.erreurs.length).length} bloc(s) !
                      </span>
                    </div>
                    {result.report
                      .filter((r) => r.erreurs.length > 0)
                      .map((r) =>
                        r.erreurs.map((err, i) => (
                          <p key={`${r.index}-${i}`} className="text-xs text-destructive font-medium">
                            Bloc #{r.index} : {err}
                          </p>
                        ))
                      )}
                  </div>
                )}

                {result && result.valid && (
                  <div className="bg-secondary border border-primary/20 rounded-lg p-3 text-sm text-primary font-medium">
                    Aucune erreur détectée.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Scenario explanation */}
          <div className="space-y-4">
            <div className="bg-card rounded-xl p-6 border border-border shadow-sm">
              <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">
                Scénario de démonstration
              </h2>
              <div className="space-y-4 text-sm">
                <div>
                  <div className="font-semibold text-card-foreground">Contexte</div>
                  <p className="text-muted-foreground text-xs mt-1">
                    Un attaquant tente de modifier une ordonnance pour falsifier l'historique médical d'un patient.
                  </p>
                </div>
                <div>
                  <div className="font-semibold text-card-foreground">Ce que fait l'attaquant</div>
                  <p className="text-muted-foreground text-xs mt-1">
                    Il édite directement les données et change un champ — sans pouvoir recalculer le hash ni régénérer la signature RSA.
                  </p>
                </div>
                <div>
                  <div className="font-semibold text-card-foreground">Ce que détecte MediChain</div>
                  <ul className="text-xs text-muted-foreground mt-1 space-y-1 list-disc list-inside">
                    <li>Le hash_bloc recalculé ne correspond plus</li>
                    <li>Le lien avec le bloc suivant est rompu</li>
                    <li>La signature RSA est invalide</li>
                  </ul>
                  <p className="text-xs text-primary font-semibold mt-2">Résultat : fraude détectée immédiatement.</p>
                </div>
              </div>
            </div>

            <div className="bg-card rounded-xl p-6 border border-border shadow-sm">
              <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">
                Mécanisme d'immutabilité
              </h2>
              <div className="font-mono text-xs text-muted-foreground bg-muted rounded-lg p-4 leading-relaxed">
                Bloc 1 : hash = H1<br />
                Bloc 2 : hash_precedent = H1, hash = H2<br />
                Bloc 3 : hash_precedent = H2, hash = H3<br />
                <br />
                Modification Bloc 1 → H1 change<br />
                → hash_precedent de Bloc 2 ≠<br />
                → H2 change → Bloc 3 invalide<br />
                → <span className="text-destructive font-semibold">chaîne brisée</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
