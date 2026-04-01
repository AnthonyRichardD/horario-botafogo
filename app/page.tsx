"use client";

import { useState, useEffect } from "react";
import { Bus, Download, X } from "lucide-react";
import { BusCard } from "@/components/bus-card";
import { LineSelector } from "@/components/line-selector";
import { ThemeToggle } from "@/components/theme-toggle";
import type { BusLine, BusScheduleData } from "@/types/bus";
import busData from "../public/horarios.json";

export default function HomePage() {
  const [selectedLineId, setSelectedLineId] = useState<string>(
    (busData as BusScheduleData).linhas[0].id
  );
  const [mounted, setMounted] = useState(false);
  
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);

  const lines: BusLine[] = (busData as BusScheduleData).linhas;
  const selectedLine = lines.find((line) => line.id === selectedLineId);

  useEffect(() => {
    setMounted(true);

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallBanner(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    if (window.matchMedia("(display-mode: standalone)").matches) {
      setShowInstallBanner(false);
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === "accepted") {
      setShowInstallBanner(false);
    }
    setDeferredPrompt(null);
  };

  if (!mounted) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-sky-50 to-cyan-50 dark:from-slate-950 dark:to-slate-900">
        <div className="animate-pulse text-muted-foreground">Carregando...</div>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen bg-gradient-to-br from-sky-50 to-cyan-50 px-4 py-8 transition-colors dark:from-slate-950 dark:to-slate-900">
      
      {/* Banner de Instalação PWA */}
      {showInstallBanner && (
        <div className="mx-auto mb-6 max-w-md overflow-hidden rounded-2xl bg-sky-500 p-4 text-white shadow-xl animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="flex items-start justify-between">
            <div className="flex gap-3">
              <div className="rounded-lg bg-white/20 p-2">
                <Download className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="font-bold">Instalar App</h3>
                <p className="text-xs text-sky-100">Acesse os horários mais rápido e offline.</p>
              </div>
            </div>
            <button 
              onClick={() => setShowInstallBanner(false)}
              className="rounded-full p-1 hover:bg-white/10"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <button
            onClick={handleInstallClick}
            className="mt-4 w-full rounded-xl bg-white py-2 text-sm font-bold text-sky-600 transition-transform active:scale-95"
          >
            Baixar Agora
          </button>
        </div>
      )}

      {/* Header */}
      <header className="mx-auto mb-8 flex max-w-md items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-sky-500 p-2 text-white shadow-lg dark:bg-sky-600">
            <Bus className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">
              Horário do Ônibus
            </h1>
            <p className="text-xs text-muted-foreground">
              Consulta em tempo real
            </p>
          </div>
        </div>
        <ThemeToggle />
      </header>

      {/* Seletor de linhas */}
      <div className="mx-auto mb-6 max-w-md">
        <LineSelector
          lines={lines}
          selectedLineId={selectedLineId}
          onSelectLine={setSelectedLineId}
        />
      </div>

      {/* Card principal */}
      <div className="mx-auto max-w-md">
        {selectedLine && <BusCard line={selectedLine} />}
      </div>

      {/* Footer */}
      <footer className="mx-auto mt-8 max-w-md text-center text-xs text-muted-foreground">
        <p>Tempo de viagem estimado: 20 minutos</p>
        <p className="mt-1">Atualizado automaticamente</p>
      </footer>

      {/* Decoração de fundo */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-sky-200/30 blur-3xl dark:bg-sky-900/20" />
        <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-cyan-200/30 blur-3xl dark:bg-cyan-900/20" />
      </div>
    </main>
  );
}