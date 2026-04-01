/**
 * Utilitários para manipulação de horários
 */

export interface TimeInfo {
  hours: number;
  minutes: number;
  seconds: number;
  totalSeconds: number;
}

/**
 * Converte string "HH:MM" para objeto Date do dia atual
 */
export function parseTimeString(timeString: string): Date {
  const [hours, minutes] = timeString.split(":").map(Number);
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  return date;
}

/**
 * Formata um Date para string "HH:MM"
 */
export function formatTime(date: Date): string {
  return date.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

/**
 * Adiciona minutos a um horário
 */
export function addMinutes(timeString: string, minutesToAdd: number): string {
  const date = parseTimeString(timeString);
  date.setMinutes(date.getMinutes() + minutesToAdd);
  return formatTime(date);
}

/**
 * Calcula a diferença em segundos entre dois horários
 */
export function getTimeDifferenceInSeconds(
  targetTime: string,
  currentTime: Date
): number {
  const target = parseTimeString(targetTime);
  return Math.floor((target.getTime() - currentTime.getTime()) / 1000);
}

/**
 * Converte segundos para formato legível (horas, minutos, segundos)
 */
export function formatCountdown(totalSeconds: number): TimeInfo {
  if (totalSeconds < 0) {
    return { hours: 0, minutes: 0, seconds: 0, totalSeconds: 0 };
  }

  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return { hours, minutes, seconds, totalSeconds };
}

/**
 * Formata o countdown para exibição
 */
export function formatCountdownString(timeInfo: TimeInfo): string {
  const { hours, minutes, seconds } = timeInfo;

  if (hours > 0) {
    return `${hours}h ${String(minutes).padStart(2, "0")}min ${String(seconds).padStart(2, "0")}s`;
  }

  if (minutes > 0) {
    return `${minutes}min ${String(seconds).padStart(2, "0")}s`;
  }

  return `${seconds}s`;
}

/**
 * Encontra o próximo horário disponível
 */
export function findNextDeparture(
  schedules: string[],
  currentTime: Date
): string | null {
  const currentTimeString = formatTime(currentTime);
  const currentMinutes =
    currentTime.getHours() * 60 + currentTime.getMinutes();
  const currentSeconds = currentTime.getSeconds();

  for (const schedule of schedules) {
    const [hours, minutes] = schedule.split(":").map(Number);
    const scheduleMinutes = hours * 60 + minutes;

    // Se o horário é futuro, ou é o horário atual mas ainda não passou (considerando segundos)
    if (
      scheduleMinutes > currentMinutes ||
      (scheduleMinutes === currentMinutes && currentSeconds === 0)
    ) {
      return schedule;
    }
  }

  return null; // Não há mais horários hoje
}

/**
 * Retorna horários futuros a partir do horário atual
 */
export function getUpcomingSchedules(
  schedules: string[],
  currentTime: Date
): string[] {
  const nextDeparture = findNextDeparture(schedules, currentTime);

  if (!nextDeparture) {
    return [];
  }

  const nextIndex = schedules.indexOf(nextDeparture);
  return schedules.slice(nextIndex);
}

/**
 * Verifica se um horário já passou
 */
export function hasTimePassed(timeString: string, currentTime: Date): boolean {
  const targetTime = parseTimeString(timeString);
  return currentTime > targetTime;
}

/**
 * Encontra o último ônibus que saiu
 */
export function findLastDeparture(
  schedules: string[],
  currentTime: Date
): string | null {
  const currentMinutes =
    currentTime.getHours() * 60 + currentTime.getMinutes();

  let lastDeparture: string | null = null;

  for (const schedule of schedules) {
    const [hours, minutes] = schedule.split(":").map(Number);
    const scheduleMinutes = hours * 60 + minutes;

    if (scheduleMinutes <= currentMinutes) {
      lastDeparture = schedule;
    } else {
      break;
    }
  }

  return lastDeparture;
}

/**
 * Calcula o tempo restante até a chegada de um ônibus que já saiu
 * Retorna segundos restantes (pode ser negativo se já chegou)
 */
export function getArrivalCountdown(
  departureTime: string,
  currentTime: Date,
  travelMinutes: number
): number {
  const arrivalTime = parseTimeString(addMinutes(departureTime, travelMinutes));
  return Math.floor((arrivalTime.getTime() - currentTime.getTime()) / 1000);
}
