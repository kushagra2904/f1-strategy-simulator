import type {
  Driver,
  OptimizeRequest,
  OptimizeResponse,
  Team,
  Track,
} from "../types/api";

const API_BASE: string =
  import.meta.env.VITE_API_BASE ?? "https://f1-strategy-simulator.onrender.com";

async function getJson<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, init);
  if (!res.ok) {
    throw new Error(`Request to ${path} failed (${res.status})`);
  }
  return (await res.json()) as T;
}

export function fetchDrivers(): Promise<Driver[]> {
  return getJson<Driver[]>("/drivers");
}

export function fetchTracks(): Promise<Track[]> {
  return getJson<Track[]>("/tracks");
}

export function fetchTeams(): Promise<Team[]> {
  return getJson<Team[]>("/teams");
}

export function optimizeStrategy(
  body: OptimizeRequest,
): Promise<OptimizeResponse> {
  return getJson<OptimizeResponse>("/optimize", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}
