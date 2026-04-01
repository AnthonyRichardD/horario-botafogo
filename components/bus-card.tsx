"use client";

import { useEffect, useState, useCallback } from "react";
import { Bus, Clock, MapPin, ChevronDown, ChevronUp, Navigation } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { BusLine } from "@/types/bus";
import {
  findNextDeparture,
  findLastDeparture,
  getTimeDifferenceInSeconds,
  getArrivalCountdown,
  formatCountdown,
  formatCountdownString,
  addMinutes,
  getUpcomingSchedules,
} from "@/utils/time";

interface BusCardProps {
  line: BusLine;
}

const TRAVEL_TIME_MINUTES = 20;

export function BusCard({ line }: BusCardProps) {
  const [currentTime, setCurrentTime] = useState<Date | null>(null);
  const [nextDeparture, setNextDeparture] = useState<string | null>(null);
  const [lastDeparture, setLastDeparture] = useState<string | null>(null);
  const [countdown, setCountdown] = useState({
    hours: 0,
    minutes: 0,
    seconds: 0,
    totalSeconds: 0,
  });
  const [arrivalCountdown, setArrivalCountdown] = useState({
    hours: 0,
    minutes: 0,
    seconds: 0,
    totalSeconds: 0,
  });
  const [showAllSchedules, setShowAllSchedules] = useState(false);
  const [upcomingSchedules, setUpcomingSchedules] = useState<string[]>([]);

  const updateScheduleData = useCallback(() => {
    const now = new Date();
    setCurrentTime(now);

    const next = findNextDeparture(line.horarios, now);
    setNextDeparture(next);

    const last = findLastDeparture(line.horarios, now);
    setLastDeparture(last);

    if (next) {
      const diffSeconds = getTimeDifferenceInSeconds(next, now);
      setCountdown(formatCountdown(diffSeconds));
      setUpcomingSchedules(getUpcomingSchedules(line.horarios, now));
    } else {
      setCountdown({ hours: 0, minutes: 0, seconds: 0, totalSeconds: 0 });
      setUpcomingSchedules([]);
    }

    if (last) {
      const arrivalSeconds = getArrivalCountdown(last, now, TRAVEL_TIME_MINUTES);
      setArrivalCountdown(formatCountdown(arrivalSeconds));
    } else {
      setArrivalCountdown({ hours: 0, minutes: 0, seconds: 0, totalSeconds: 0 });
    }
  }, [line.horarios]);

  useEffect(() => {
    updateScheduleData();

    const interval = setInterval(updateScheduleData, 1000);

    return () => clearInterval(interval);
  }, [updateScheduleData]);

  const arrivalTime = nextDeparture
    ? addMinutes(nextDeparture, TRAVEL_TIME_MINUTES)
    : null;

  const lastArrivalTime = lastDeparture
    ? addMinutes(lastDeparture, TRAVEL_TIME_MINUTES)
    : null;
  
  const hasLastBusArrived = arrivalCountdown.totalSeconds <= 0;

  const isUrgent = countdown.totalSeconds > 0 && countdown.totalSeconds <= 300;
  const isVeryUrgent =
    countdown.totalSeconds > 0 && countdown.totalSeconds <= 60;

  if (!currentTime) {
    return (
      <Card className="w-full max-w-md animate-pulse">
        <CardHeader className="pb-3">
          <div className="h-6 w-32 rounded bg-muted" />
        </CardHeader>
        <CardContent>
          <div className="h-20 rounded bg-muted" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md overflow-hidden transition-all duration-300 hover:shadow-lg px-4">
      {/* Header com nome da linha */}
      <CardHeader className="bg-linear-to-r from-sky-500 w-full flex to-cyan-500 py-4 text-white dark:from-sky-600 dark:to-cyan-600 rounded-md">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-white/20 p-2 backdrop-blur-sm">
              <Bus className="h-6 w-6" />
            </div>
            <div>
              <CardTitle className="text-lg font-bold">{line.nome}</CardTitle>
              <div className="flex items-center gap-1 text-sm text-white/90">
                <MapPin className="h-3 w-3" />
                {line.destino}
              </div>
            </div>
          </div>
          <Badge
            variant="secondary"
            className="bg-white/20 text-white hover:bg-white/30"
          >
            {line.id}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="pt-4">
        <Tabs defaultValue="proximo" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="proximo" className="gap-2">
              <Clock className="h-4 w-4" />
              Próximo
            </TabsTrigger>
            <TabsTrigger value="transito" className="gap-2">
              <Navigation className="h-4 w-4" />
              Em Trânsito
            </TabsTrigger>
          </TabsList>

          {/* Tab: Próximo Ônibus */}
          <TabsContent value="proximo" className="mt-4 space-y-4">
            {nextDeparture ? (
              <>
                {/* Próximo horário */}
                <div className="text-center">
                  <p className="mb-1 text-sm text-muted-foreground">
                    Próximo ônibus
                  </p>
                  <div
                    className={`text-5xl font-bold tabular-nums tracking-tight transition-colors ${
                      isVeryUrgent
                        ? "animate-pulse text-red-500"
                        : isUrgent
                          ? "text-amber-500"
                          : "text-foreground"
                    }`}
                  >
                    {nextDeparture}
                  </div>
                </div>

                {/* Contador regressivo */}
                <div
                  className={`rounded-xl p-4 text-center transition-all ${
                    isVeryUrgent
                      ? "bg-red-100 dark:bg-red-950/50"
                      : isUrgent
                        ? "bg-amber-100 dark:bg-amber-950/50"
                        : "bg-muted"
                  }`}
                >
                  <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    Tempo restante
                  </div>
                  <div
                    className={`mt-1 text-2xl font-semibold tabular-nums ${
                      isVeryUrgent
                        ? "text-red-600 dark:text-red-400"
                        : isUrgent
                          ? "text-amber-600 dark:text-amber-400"
                          : "text-foreground"
                    }`}
                  >
                    {formatCountdownString(countdown)}
                  </div>
                  {isUrgent && !isVeryUrgent && (
                    <p className="mt-1 text-xs text-amber-600 dark:text-amber-400">
                      Corra! O ônibus está chegando
                    </p>
                  )}
                  {isVeryUrgent && (
                    <p className="mt-1 text-xs font-medium text-red-600 dark:text-red-400">
                      Último minuto! Corra!
                    </p>
                  )}
                </div>

                {/* Horário de chegada */}
                <div className="flex items-center justify-between rounded-lg border border-border bg-card p-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    Chegada estimada
                  </div>
                  <span className="text-lg font-semibold">{arrivalTime}</span>
                </div>

                {/* Botão para ver todos os horários */}
                <Button
                  variant="ghost"
                  className="w-full"
                  onClick={() => setShowAllSchedules(!showAllSchedules)}
                >
                  {showAllSchedules ? (
                    <>
                      <ChevronUp className="mr-2 h-4 w-4" />
                      Ocultar horários
                    </>
                  ) : (
                    <>
                      <ChevronDown className="mr-2 h-4 w-4" />
                      Ver todos os horários ({upcomingSchedules.length} restantes)
                    </>
                  )}
                </Button>

                {/* Lista de horários */}
                {showAllSchedules && (
                  <div className="animate-in fade-in slide-in-from-top-2 rounded-lg border border-border bg-muted/50 p-3 duration-200">
                    <p className="mb-2 text-xs font-medium text-muted-foreground">
                      Próximos horários
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {upcomingSchedules.map((schedule, index) => (
                        <Badge
                          key={schedule}
                          variant={index === 0 ? "default" : "outline"}
                          className={`tabular-nums transition-all ${
                            index === 0
                              ? "bg-sky-500 hover:bg-sky-600"
                              : "hover:bg-muted"
                          }`}
                        >
                          {schedule}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              /* Sem mais horários */
              <div className="py-8 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                  <Bus className="h-8 w-8 text-muted-foreground" />
                </div>
                <p className="text-lg font-medium text-muted-foreground">
                  Sem mais horários hoje
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  O primeiro ônibus amanhã é às {line.horarios[0]}
                </p>
              </div>
            )}
          </TabsContent>

          {/* Tab: Em Trânsito */}
          <TabsContent value="transito" className="mt-4 space-y-4">
            {lastDeparture ? (
              <>
                {/* Último que saiu */}
                <div className="text-center">
                  <p className="mb-1 text-sm text-muted-foreground">
                    Último ônibus que saiu
                  </p>
                  <div className="text-5xl font-bold tabular-nums tracking-tight text-foreground">
                    {lastDeparture}
                  </div>
                </div>

                {/* Status de chegada */}
                {hasLastBusArrived ? (
                  <div className="rounded-xl bg-emerald-100 p-4 text-center dark:bg-emerald-950/50">
                    <div className="flex items-center justify-center gap-2 text-sm text-emerald-700 dark:text-emerald-400">
                      <MapPin className="h-4 w-4" />
                      Chegou ao destino
                    </div>
                    <div className="mt-1 text-2xl font-semibold text-emerald-600 dark:text-emerald-400">
                      {lastArrivalTime}
                    </div>
                    <p className="mt-1 text-xs text-emerald-600 dark:text-emerald-400">
                      O ônibus já chegou ao destino
                    </p>
                  </div>
                ) : (
                  <div className="rounded-xl bg-sky-100 p-4 text-center dark:bg-sky-950/50">
                    <div className="flex items-center justify-center gap-2 text-sm text-sky-700 dark:text-sky-400">
                      <Navigation className="h-4 w-4 animate-pulse" />
                      Tempo até chegar
                    </div>
                    <div className="mt-1 text-2xl font-semibold tabular-nums text-sky-600 dark:text-sky-400">
                      {formatCountdownString(arrivalCountdown)}
                    </div>
                    <p className="mt-1 text-xs text-sky-600 dark:text-sky-400">
                      Previsão de chegada às {lastArrivalTime}
                    </p>
                  </div>
                )}

                {/* Informações do trajeto */}
                <div className="rounded-lg border border-border bg-card p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      Saiu às
                    </div>
                    <span className="font-semibold">{lastDeparture}</span>
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      Chegada estimada às
                    </div>
                    <span className="font-semibold">{lastArrivalTime}</span>
                  </div>
                </div>
              </>
            ) : (
              /* Nenhum ônibus saiu ainda */
              <div className="py-8 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                  <Navigation className="h-8 w-8 text-muted-foreground" />
                </div>
                <p className="text-lg font-medium text-muted-foreground">
                  Nenhum ônibus em trânsito
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  O primeiro ônibus sai às {line.horarios[0]}
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
