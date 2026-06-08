// Mirrors the FastAPI contracts in backend/main.py (/drivers, /tracks, /optimize).

export type Compound = "SOFT" | "MEDIUM" | "HARD";

export interface Driver {
  id: string;
  name: string;
  team: string;
  team_color: string;
}

export interface Team {
  id: string;
  name: string;
  color: string;
}

export interface Track {
  name: string;
  file: string;
  laps: number;
}

export interface Stint {
  compound: Compound;
  length: number;
}

export interface Strategy {
  strategy: Stint[];
  total_time: number;
  delta_to_best?: number;
}

/** [startLap, endLap] inclusive, as emitted by the backend. */
export type SafetyCarPeriod = [number, number];

export interface OptimizeRequest {
  driver: string;
  track: string;
  seed?: number;
}

export interface OptimizeResponse {
  track: string;
  track_laps: number;
  driver: string;
  driver_delta: number;
  seed: number;
  safety_car_periods: SafetyCarPeriod[];
  best_strategy: Strategy;
  top_5_strategies: Strategy[];
}

export interface LapTelemetry {
  lap: number;
  stint_index: number;
  compound: Compound;
  tire_age: number;
  lap_time: number;
  pit_time: number;
  safety_car: boolean;
  pit_in: boolean;
}

export interface TelemetryStint {
  stint_index: number;
  compound: Compound;
  length: number;
  start_lap: number;
  end_lap: number;
  avg_time: number;
  best_time: number;
}

export interface TelemetryRequest {
  driver: string;
  track: string;
  strategy: Stint[];
  seed?: number;
}

export interface TelemetryResponse {
  track: string;
  track_laps: number;
  driver: string;
  driver_delta: number;
  seed: number;
  safety_car_periods: SafetyCarPeriod[];
  laps: LapTelemetry[];
  stints: TelemetryStint[];
  total_time: number;
  fastest_lap: number;
  fastest_lap_number: number;
}
