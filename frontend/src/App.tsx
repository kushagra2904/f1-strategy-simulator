import { lazy, Suspense, useCallback, useEffect, useState } from "react";
import { Header } from "./components/Header";
import type { Tab } from "./components/Header";
import { ControlPanel } from "./components/ControlPanel";
import { DriverCard } from "./components/DriverCard";
import { TrackDisplay } from "./components/TrackDisplay";
import { ResultsPanel } from "./components/ResultsPanel";
import { StrategyView } from "./components/StrategyView";
import { TelemetryView } from "./components/TelemetryView";
import { CreditsFooter } from "./components/CreditsFooter";

// Lazy so three.js only loads when the Assets tab is opened.
const AssetGallery = lazy(() => import("./components/AssetGallery"));
import { fetchDrivers, fetchTracks, optimizeStrategy } from "./lib/api";
import type { Driver, OptimizeResponse, Track } from "./types/api";

export default function App() {
  const [tab, setTab] = useState<Tab>("Dashboard");

  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [metaLoading, setMetaLoading] = useState(true);
  const [metaError, setMetaError] = useState<string | null>(null);

  const [driverId, setDriverId] = useState("");
  const [trackName, setTrackName] = useState("");

  const [result, setResult] = useState<OptimizeResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load driver + track lists from the backend (single source of truth).
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [driverList, trackList] = await Promise.all([
          fetchDrivers(),
          fetchTracks(),
        ]);
        if (cancelled) return;
        setDrivers(driverList);
        setTracks(trackList);
        setDriverId(driverList[0]?.id ?? "");
        setTrackName(trackList[0]?.name ?? "");
      } catch (err) {
        console.error(err);
        if (!cancelled) setMetaError("Failed to load drivers and tracks");
      } finally {
        if (!cancelled) setMetaLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const selectedTrack = tracks.find((t) => t.name === trackName) ?? null;
  const selectedDriver = drivers.find((d) => d.id === driverId) ?? null;

  const handleOptimize = useCallback(async () => {
    if (!selectedDriver || !selectedTrack) return;

    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const data = await optimizeStrategy({
        driver: selectedDriver.name,
        track: selectedTrack.name,
      });
      setResult(data);
    } catch (err) {
      console.error(err);
      setError("Failed to optimize strategy");
    } finally {
      setLoading(false);
    }
  }, [selectedDriver, selectedTrack]);

  // The Telemetry/Strategy tabs need a result; auto-run an optimization when
  // they're opened and none exists yet (and we're not already loading/errored).
  useEffect(() => {
    if (
      (tab === "Telemetry" || tab === "Strategy") &&
      !result &&
      !loading &&
      !error &&
      selectedDriver &&
      selectedTrack
    ) {
      handleOptimize();
    }
  }, [tab, result, loading, error, selectedDriver, selectedTrack, handleOptimize]);

  const teamColor = selectedDriver?.team_color ?? "#ff1e27";

  return (
    <div className="relative min-h-screen text-on-surface">
      {/* Atmospheric command-center backdrop. */}
      <div className="backdrop-pitwall pointer-events-none fixed inset-0 -z-10" />
      {/* Per-driver team-colour glow, top-right. */}
      <div
        className="pointer-events-none fixed inset-0 -z-10 transition-[background] duration-700"
        style={{
          background: `radial-gradient(70% 55% at 85% 0%, ${teamColor}24, transparent 60%)`,
        }}
      />

      <Header active={tab} onTab={setTab} />

      <main className="mx-auto max-w-7xl px-6 py-8">
        {tab === "Dashboard" ? (
          <div className="space-y-6">
            {metaError && (
              <p className="text-error" role="alert">
                {metaError}
              </p>
            )}

            {/* Band 1 — driver hero */}
            <div className="animate-reveal" style={{ animationDelay: "40ms" }}>
              <DriverCard driver={selectedDriver} />
            </div>

            {/* Band 2 — race setup + interactive circuit */}
            <div className="grid gap-6 lg:grid-cols-[minmax(0,4fr)_minmax(0,8fr)] lg:items-stretch">
              <div
                className="animate-reveal h-full"
                style={{ animationDelay: "120ms" }}
              >
                <ControlPanel
                  drivers={drivers}
                  tracks={tracks}
                  driverId={driverId}
                  trackName={trackName}
                  onDriverChange={setDriverId}
                  onTrackChange={setTrackName}
                  onOptimize={handleOptimize}
                  loading={loading}
                  disabled={metaLoading}
                />
              </div>
              <div
                className="animate-reveal h-full"
                style={{ animationDelay: "200ms" }}
              >
                <TrackDisplay track={selectedTrack} />
              </div>
            </div>

            {/* Band 3 — results, full width */}
            {error && (
              <p className="text-error" role="alert">
                {error}
              </p>
            )}
            {result && <ResultsPanel result={result} />}
          </div>
        ) : tab === "Assets" ? (
          <Suspense
            fallback={
              <div className="glass grid place-items-center py-24">
                <p className="hud-label">Loading 3D…</p>
              </div>
            }
          >
            <AssetGallery
              drivers={drivers}
              driverId={driverId}
              onDriverChange={setDriverId}
              driver={selectedDriver}
            />
          </Suspense>
        ) : (
          <section>
            {error ? (
              <div className="glass panel-clip edge-accent grid place-items-center px-6 py-20 text-center">
                <div className="max-w-md space-y-2">
                  <p className="hud-label text-error">Optimization Failed</p>
                  <p className="text-on-surface-variant">{error}</p>
                </div>
              </div>
            ) : !result || loading ? (
              <div className="glass panel-clip grid place-items-center py-24">
                <p className="hud-label animate-pulse-glow">
                  Running optimization…
                </p>
              </div>
            ) : tab === "Strategy" ? (
              <StrategyView
                result={result}
                driver={selectedDriver}
                track={selectedTrack}
              />
            ) : (
              <TelemetryView
                result={result}
                driver={selectedDriver}
                track={selectedTrack}
              />
            )}
          </section>
        )}
      </main>

      <CreditsFooter />
    </div>
  );
}
