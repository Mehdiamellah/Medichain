import { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  FilePlus,
  History,
  ShieldCheck,
  Zap,
  Radio,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useBlockchain } from "@/hooks/useBlockchain";
import { useState } from "react";

const NAV_ITEMS = [
  { label: "Tableau de bord", path: "/", icon: LayoutDashboard },
  { label: "Enregistrer un acte", path: "/enregistrer", icon: FilePlus },
  { label: "Historique patient", path: "/historique", icon: History },
  { label: "Vérifier la chaîne", path: "/verifier", icon: ShieldCheck },
  { label: "Simulation d'attaque", path: "/attaque", icon: Zap },
];

export default function AppLayout({ children }: { children: ReactNode }) {
  const location = useLocation();
  const { stats, reset } = useBlockchain();
  const [showReset, setShowReset] = useState(false);

  return (
    <div className="flex min-h-screen w-full">
      {/* Sidebar */}
      <aside className="w-64 shrink-0 border-r border-sidebar-border bg-sidebar flex flex-col">
        {/* Logo */}
        <div className="px-5 pt-5 pb-4 border-b border-sidebar-border">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-primary-foreground">
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5" />
                <path d="M2 12l10 5 10-5" />
              </svg>
            </div>
            <div>
              <div className="font-bold text-sidebar-foreground text-base tracking-tight">MediChain</div>
              <div className="text-xs text-muted-foreground">Blockchain médicale</div>
            </div>
          </div>
        </div>

        {/* Stats bar */}
        <div className="px-5 py-3 border-b border-sidebar-border flex gap-4">
          <div>
            <div className="text-lg font-bold text-primary">{stats.total_blocs}</div>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Blocs</div>
          </div>
          <div>
            <div className="text-lg font-bold text-primary">{stats.transactions}</div>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Actes</div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          <div className="px-2 mb-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            Navigation
          </div>
          {NAV_ITEMS.map((item) => {
            const active = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  active
                    ? "bg-primary text-primary-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent"
                }`}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Active nodes */}
        {stats.hopitaux.length > 0 && (
          <div className="px-5 py-3 border-t border-sidebar-border">
            <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">
              Nœuds actifs
            </div>
            {stats.hopitaux.map((h) => (
              <div key={h} className="flex items-center gap-2 py-1 text-xs text-sidebar-foreground">
                <Radio className="w-3 h-3 text-primary animate-pulse-dot" />
                <span className="truncate">{h}</span>
              </div>
            ))}
          </div>
        )}

        {/* Reset */}
        <div className="px-5 py-4 border-t border-sidebar-border">
          {!showReset ? (
            <Button
              variant="outline"
              size="sm"
              className="w-full text-xs"
              onClick={() => setShowReset(true)}
            >
              <RotateCcw className="w-3 h-3 mr-1" />
              Réinitialiser
            </Button>
          ) : (
            <div className="space-y-2">
              <p className="text-xs text-destructive font-medium">Supprimer tous les blocs ?</p>
              <div className="flex gap-2">
                <Button size="sm" variant="destructive" className="flex-1 text-xs" onClick={() => { reset(); setShowReset(false); }}>
                  Confirmer
                </Button>
                <Button size="sm" variant="outline" className="flex-1 text-xs" onClick={() => setShowReset(false)}>
                  Annuler
                </Button>
              </div>
            </div>
          )}
          <div className="mt-3 text-[10px] text-muted-foreground text-center leading-relaxed">
            RSA + SHA-256 · RGPD-compliant<br />Blockchain privée permissionnée
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-6xl mx-auto p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
