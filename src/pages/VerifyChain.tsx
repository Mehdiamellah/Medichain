import { useState } from "react";
import { useBlockchain } from "@/hooks/useBlockchain";
import { Button } from "@/components/ui/button";
import { ShieldCheck, Link, KeyRound, CheckCircle2, XCircle } from "lucide-react";

export default function VerifyChain() {
  const { validateChain, chain } = useBlockchain();
  const [result, setResult] = useState<ReturnType<typeof validateChain> | null>(null);

  const handleVerify = () => {
    setResult(validateChain());
  };

  return (
    <div className="animate-fade-in">
      <div className="bg-primary rounded-xl p-7 mb-6">
        <h1 className="text-2xl font-bold text-primary-foreground tracking-tight">Vérification de la chaîne</h1>
        <p className="text-primary-foreground/70 text-sm mt-1">
          Contrôle cryptographique complet — hash, chaînage et signature RSA de chaque bloc
        </p>
      </div>

      {/* Process explanation */}
      <div className="grid sm:grid-cols-3 gap-4 mb-6">
        {[
          { icon: ShieldCheck, step: "1", title: "Intégrité du bloc", desc: "Recalcul du hash_bloc et comparaison avec la valeur stockée" },
          { icon: Link, step: "2", title: "Chaînage", desc: "Vérification que hash_precedent correspond au bloc parent" },
          { icon: KeyRound, step: "3", title: "Signature RSA", desc: "Vérification de l'identité du médecin via sa clé publique" },
        ].map((s) => (
          <div key={s.step} className="bg-card rounded-xl p-5 border border-border shadow-sm text-center">
            <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold mx-auto mb-3">
              {s.step}
            </div>
            <div className="font-semibold text-sm text-card-foreground">{s.title}</div>
            <div className="text-xs text-muted-foreground mt-1">{s.desc}</div>
          </div>
        ))}
      </div>

      <Button onClick={handleVerify} className="w-full mb-6">
        Lancer la vérification complète
      </Button>

      {result && (
        <div className="space-y-4">
          {/* Summary */}
          {result.valid ? (
            <div className="bg-secondary border border-primary/20 rounded-lg p-5 flex items-center gap-3">
              <CheckCircle2 className="w-6 h-6 text-primary shrink-0" />
              <div>
                <div className="font-semibold text-primary">Chaîne valide</div>
                <div className="text-sm text-muted-foreground">
                  Aucune falsification détectée sur les {result.report.length} blocs vérifiés
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-5 flex items-center gap-3">
              <XCircle className="w-6 h-6 text-destructive shrink-0" />
              <div>
                <div className="font-semibold text-destructive">Chaîne corrompue</div>
                <div className="text-sm text-muted-foreground">
                  {result.report.filter((r) => r.erreurs.length > 0).length} bloc(s) invalide(s) détecté(s)
                </div>
              </div>
            </div>
          )}

          {/* Detail */}
          <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Rapport détaillé</h2>
          <div className="space-y-2">
            {result.report.map((entry) => {
              const block = chain[entry.index];
              const valid = entry.erreurs.length === 0;
              return (
                <div key={entry.index} className="bg-card rounded-xl p-4 border border-border shadow-sm">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="bg-primary text-primary-foreground text-xs font-bold px-2 py-0.5 rounded-md">
                      Bloc #{entry.index}
                    </span>
                    <span className="bg-secondary text-secondary-foreground text-xs font-medium px-2 py-0.5 rounded-md">
                      {block?.type_evenement}
                    </span>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-md ${
                      valid
                        ? "bg-secondary text-primary"
                        : "bg-destructive/10 text-destructive"
                    }`}>
                      {valid ? "Valide" : "Corrompu"}
                    </span>
                    <div className="ml-auto flex gap-2 text-xs text-muted-foreground">
                      <span>Hash {entry.hash_valide ? "✓" : "✗"}</span>
                      <span>Lien {entry.lien_valide ? "✓" : "✗"}</span>
                      <span>Signature {entry.signature_valide ? "✓" : "✗"}</span>
                    </div>
                  </div>
                  {entry.erreurs.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {entry.erreurs.map((err, i) => (
                        <p key={i} className="text-xs text-destructive font-medium">⚠ {err}</p>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
