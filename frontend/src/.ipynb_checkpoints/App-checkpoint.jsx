import { useState } from "react";
import "./App.css";
import StrategyTimeline from "./components/StrategyTimeline.jsx";

/* ============================
   BACKEND CONFIG
============================ */

const API_BASE = "https://f1-strategy-simulator.onrender.com";

/* ============================
   DRIVER & TRACK DEFINITIONS
============================ */

const DRIVERS = [
  { id: "VER", name: "Max Verstappen" },
  { id: "PER", name: "Sergio Pérez" },
  { id: "HAM", name: "Lewis Hamilton" },
  { id: "RUS", name: "George Russell" },
  { id: "LEC", name: "Charles Leclerc" },
  { id: "SAI", name: "Carlos Sainz" },
  { id: "NOR", name: "Lando Norris" },
  { id: "PIA", name: "Oscar Piastri" },
  { id: "ALO", name: "Fernando Alonso" },
  { id: "STR", name: "Lance Stroll" },
  { id: "OCO", name: "Esteban Ocon" },
  { id: "GAS", name: "Pierre Gasly" },
  { id: "ALB", name: "Alex Albon" },
  { id: "SAR", name: "Logan Sargeant" },
  { id: "TSU", name: "Yuki Tsunoda" },
  { id: "RIC", name: "Daniel Ricciardo" },
  { id: "BOT", name: "Valtteri Bottas" },
  { id: "ZHO", name: "Zhou Guanyu" },
  { id: "HUL", name: "Nico Hülkenberg" },
  { id: "MAG", name: "Kevin Magnussen" },
];

const TRACKS = [
  { name: "Bahrain", file: "bahrain.png", laps: 57 },
  { name: "Saudi Arabia (Jeddah)", file: "jeddah.png", laps: 50 },
  { name: "Australia (Albert Park)", file: "albert_park.png", laps: 58 },
  { name: "Japan (Suzuka)", file: "suzuka.png", laps: 53 },
  { name: "China (Shanghai)", file: "shanghai.png", laps: 56 },
  { name: "Miami", file: "miami.png", laps: 57 },
  { name: "Emilia Romagna (Imola)", file: "imola.png", laps: 63 },
  { name: "Monaco", file: "monaco.png", laps: 78 },
  { name: "Canada (Montreal)", file: "montreal.png", laps: 70 },
  { name: "Spain (Barcelona)", file: "barcelona.png", laps: 66 },
  { name: "Austria (Spielberg)", file: "spielberg.png", laps: 71 },
  { name: "Great Britain (Silverstone)", file: "silverstone.png", laps: 52 },
  { name: "Hungary (Budapest)", file: "hungary.png", laps: 70 },
  { name: "Belgium (Spa)", file: "spa.png", laps: 44 },
  { name: "Netherlands (Zandvoort)", file: "zandvoort.png", laps: 72 },
  { name: "Italy (Monza)", file: "monza.png", laps: 53 },
  { name: "Azerbaijan (Baku)", file: "baku.png", laps: 51 },
  { name: "Singapore", file: "singapore.png", laps: 62 },
  { name: "United States (COTA)", file: "austin.png", laps: 56 },
  { name: "Mexico", file: "mexico.png", laps: 71 },
  { name: "Brazil (Interlagos)", file: "interlagos.png", laps: 71 },
  { name: "Las Vegas", file: "vegas.png", laps: 50 },
  { name: "Qatar (Lusail)", file: "lusail.png", laps: 57 },
  { name: "Abu Dhabi (Yas Marina)", file: "yas_marina.png", laps: 58 },
];

/* ============================
   APP COMPONENT
============================ */

export default function App() {
  const [driver, setDriver] = useState("VER");
  const [track, setTrack] = useState(TRACKS[0]);

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const optimizeStrategy = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const selectedDriver = DRIVERS.find((d) => d.id === driver);

      const response = await fetch(`${API_BASE}/optimize`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          driver: selectedDriver.name,
          track: track.name,
        }),
      });

      if (!response.ok) {
        throw new Error("Backend error");
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      console.error(err);
      setError("Failed to optimize strategy");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app">
      <h1>AI-Based F1 Strategy Simulator</h1>

      <div className="layout">
        {/* LEFT — DATA (40%) */}
        <div className="left-panel">
          <label>Driver</label>
          <select value={driver} onChange={(e) => setDriver(e.target.value)}>
            {DRIVERS.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>

          <label>Track</label>
          <select
            value={track.name}
            onChange={(e) =>
              setTrack(TRACKS.find((t) => t.name === e.target.value))
            }
          >
            {TRACKS.map((t) => (
              <option key={t.name} value={t.name}>
                {t.name}
              </option>
            ))}
          </select>

          <button
            className={`optimize-btn ${loading ? "loading" : ""}`}
            onClick={optimizeStrategy}
            disabled={loading}
          >
            {loading ? "Optimizing Strategy…" : "Optimize Strategy"}
          </button>

          {error && <p className="error-text">{error}</p>}

          {result?.best_strategy && (
            <div className="strategy-box">
              <h3>🏁 Best Strategy</h3>

              {result.best_strategy.strategy.map((stint, i) => (
                <p key={i}>
                  {stint.compound} — {stint.length} laps
                </p>
              ))}

              <StrategyTimeline
                strategy={result.best_strategy.strategy}
                totalLaps={track.laps}
              />
            </div>
          )}
        </div>

        {/* RIGHT — TRACK IMAGE (60%) */}
        <div className="right-panel">
          <h2>🗺 Track Layout</h2>

          <div className="track-wrapper zoomable">
            <img
              src={`/tracks/${track.file}`}
              alt={track.name}
              className="track-image"
            />
          </div>
        </div>
      </div>
    </div>
  );
}