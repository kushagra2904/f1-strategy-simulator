import { lazy, Suspense, useEffect, useState } from "react";
import { Header } from "./components/Header";
import type { Tab } from "./components/Header";
import { ControlPanel } from "./components/ControlPanel";
import { DriverCard } from "./components/DriverCard";
import { TrackDisplay } from "./components/TrackDisplay";
import { ResultsPanel } from "./components/ResultsPanel";
import { Placeholder } from "./components/Placeholder";
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

  async function handleOptimize() {
    const driver = drivers.find((d) => d.id === driverId);
    if (!driver || !selectedTrack) return;

    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const data = await optimizeStrategy({
        driver: driver.name,
        track: selectedTrack.name,
      });
      setResult(data);
    } catch (err) {
      console.error(err);
      setError("Failed to optimize strategy");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-surface text-on-surface">
      <Header active={tab} onTab={setTab} />

      <main className="mx-auto max-w-7xl px-6 py-8">
        {tab === "Dashboard" ? (
          <div className="grid gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
            <div className="space-y-6">
              {metaError && <p className="text-error">{metaError}</p>}
              <DriverCard driver={selectedDriver} />
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
              {error && <p className="text-error">{error}</p>}
              {result && <ResultsPanel result={result} />}
            </div>

            <TrackDisplay track={selectedTrack} />
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
          <Placeholder
            title={tab}
            note="Live telemetry views are planned for a future update."
          />
        )}
      </main>

      <CreditsFooter />
    </div>
  );
}
