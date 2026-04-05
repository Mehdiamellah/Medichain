import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import AppLayout from "@/components/AppLayout";
import Dashboard from "@/pages/Dashboard";
import RegisterAct from "@/pages/RegisterAct";
import PatientHistory from "@/pages/PatientHistory";
import VerifyChain from "@/pages/VerifyChain";
import AttackSimulation from "@/pages/AttackSimulation";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppLayout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/enregistrer" element={<RegisterAct />} />
            <Route path="/historique" element={<PatientHistory />} />
            <Route path="/verifier" element={<VerifyChain />} />
            <Route path="/attaque" element={<AttackSimulation />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AppLayout>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
