export interface BusLine {
  id: string;
  nome: string;
  destino: string;
  horarios: string[];
}

export interface BusScheduleData {
  linhas: BusLine[];
}

export interface CountdownState {
  hours: number;
  minutes: number;
  seconds: number;
  totalSeconds: number;
}
