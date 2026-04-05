import { useBlockchain } from "@/hooks/useBlockchain";
import { Boxes, FileText, Users, Building2 } from "lucide-react";

export default function Dashboard() {
  const { stats, chain } = useBlockchain();

  const statCards = [
    { label: "Total blocs", value: stats.total_blocs, icon: Boxes },
    { label: "Actes médicaux", value: stats.transactions, icon: FileText },
    { label: "Patients", value: stats.patients_uniques, icon: Users },
    { label: "Établissements", value: stats.hopitaux.length, icon: Building2 },
  ];

  const recentBlocks = [...chain].reverse().slice(0, 6);
  const totalTypes = Object.values(stats.types).reduce((a, b) => a + b, 0);

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="bg-primary rounded-xl p-7 mb-6">
        <h1 className="text-2xl font-bold text-primary-foreground tracking-tight">Tableau de bord</h1>
        <p className="text-primary-foreground/70 text-sm mt-1">
          Vue générale de la blockchain médicale — chaîne de blocs en temps réel
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((s) => (
          <div key={s.label} className="bg-card rounded-xl p-5 border-l-4 border-l-primary shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-primary">{s.value}</div>
                <div className="text-[11px] uppercase tracking-wider text-muted-foreground mt-1">{s.label}</div>
              </div>
              <s.icon className="w-8 h-8 text-primary/20" />
            </div>
          </div>
        ))}
      </div>

      {/* Charts + Network */}
      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        {/* Type distribution */}
        {totalTypes > 0 && (
          <div className="bg-card rounded-xl p-6 shadow-sm border border-border">
            <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">
              Répartition par type d'acte
            </h2>
            <div className="space-y-3">
              {Object.entries(stats.types).map(([type, count]) => {
                const pct = Math.round((count / totalTypes) * 100);
                return (
                  <div key={type}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-card-foreground font-medium">{type}</span>
                      <span className="text-muted-foreground">{count}</span>
                    </div>
                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Network */}
        <div className="bg-card rounded-xl p-6 shadow-sm border border-border">
          <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">
            Architecture réseau (P2P simulé)
          </h2>
          <div className="text-center py-4">
            <div className="text-sm font-semibold text-card-foreground mb-4">Blockchain privée permissionnée</div>
            <div className="flex items-center justify-center gap-3 flex-wrap">
              {["CHU Casablanca", "CHU Rabat", "CHU Marrakech"].map((node, i) => (
                <div key={node} className="flex items-center gap-2">
                  <div className="bg-secondary rounded-lg px-4 py-3 text-center">
                    <div className="text-sm font-semibold text-secondary-foreground">{node.split(" ")[1]}</div>
                    <div className="text-[10px] text-muted-foreground">{node.split(" ")[0]}</div>
                  </div>
                  {i < 2 && <span className="text-muted-foreground font-bold">⇄</span>}
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-4">
              Même chaîne partagée · Ministère de la Santé (autorité)
            </p>
          </div>
        </div>
      </div>

      {/* Recent blocks */}
      <div>
        <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">
          Derniers blocs enregistrés
        </h2>
        {stats.transactions === 0 ? (
          <div className="bg-card rounded-xl p-6 border border-border text-center text-sm text-muted-foreground">
            Aucun acte médical enregistré. Utilisez « Enregistrer un acte » pour ajouter le premier bloc.
          </div>
        ) : (
          <div className="space-y-3">
            {recentBlocks.map((bloc) => (
              <div
                key={bloc.index}
                className="bg-card rounded-xl p-4 border border-border shadow-sm animate-fade-in"
              >
                <div className="flex items-center gap-2 flex-wrap mb-2">
                  <span className="bg-primary text-primary-foreground text-xs font-bold px-2.5 py-0.5 rounded-md">
                    Bloc #{bloc.index}
                  </span>
                  <span className="bg-secondary text-secondary-foreground text-xs font-semibold px-2.5 py-0.5 rounded-md border border-border">
                    {bloc.type_evenement}
                  </span>
                  {bloc.medecin !== "Système" && (
                    <span className="text-xs text-muted-foreground">{bloc.medecin}</span>
                  )}
                  <span className="text-xs text-muted-foreground ml-auto">
                    {bloc.timestamp.slice(0, 19).replace("T", " ")}
                  </span>
                </div>
                {bloc.type_evenement !== "genesis" && (
                  <div className="text-xs text-muted-foreground mb-1">
                    Patient : {bloc.patient_id} · Établissement : {bloc.hopital}
                  </div>
                )}
                <div className="font-mono text-[11px] text-muted-foreground bg-muted rounded px-2 py-1">
                  Hash : {bloc.hash_bloc}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
