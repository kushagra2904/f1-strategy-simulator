import { useState } from "react";
import "./App.css";
import StrategyTimeline from "./components/StrategyTimeline.jsx";

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
  { name: "Bahrain", file: "bahrain.png" },
  { name: "Saudi Arabia (Jeddah)", file: "jeddah.png" },
  { name: "Australia (Albert Park)", file: "albert_park.png" },
  { name: "Japan (Suzuka)", file: "suzuka.png" },
  { name: "China (Shanghai)", file: "shanghai.png" },
  { name: "Miami", file: "miami.png" },
  { name: "Emilia Romagna (Imola)", file: "imola.png" },
  { name: "Monaco", file: "monaco.png" },
  { name: "Canada (Montreal)", file: "montreal.png" },
  { name: "Spain (Barcelona)", file: "barcelona.png" },
  { name: "Austria (Spielberg)", file: "spielberg.png" },
  { name: "Great Britain (Silverstone)", file: "silverstone.png" },
  { name: "Hungary (Budapest)", file: "hungary.png" },
  { name: "Belgium (Spa)", file: "spa.png" },
  { name: "Netherlands (Zandvoort)", file: "zandvoort.png" },
  { name: "Italy (Monza)", file: "monza.png" },
  { name: "Azerbaijan (Baku)", file: "baku.png" },
  { name: "Singapore", file: "singapore.png" },
  { name: "United States (COTA)", file: "austin.png" },
  { name: "Mexico", file: "mexico.png" },
  { name: "Brazil (Interlagos)", file: "interlagos.png" },
  { name: "Las Vegas", file: "vegas.png" },
  { name: "Qatar (Lusail)", file: "lusail.png" },
  { name: "Abu Dhabi (Yas Marina)", file: "yas_marina.png" },
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

      const response = await fetch("https://f1-strategy-simulator.onrender.com/optimize", {
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

          {/* OPTIMIZE BUTTON */}
          <button
            className={`optimize-btn ${loading ? "loading" : ""}`}
            onClick={optimizeStrategy}
            disabled={loading}
          >
            {loading ? (
              <div className="loader">
                <span className="spinner" />
                Optimizing Strategy…
              </div>
            ) : (
              "Optimize Strategy"
            )}
          </button>

          {error && <p className="error-text">{error}</p>}

          {/* DRIVER DELTA */}
          {result?.driver_delta !== undefined && (
            <p className="driver-delta">
              <strong>Driver Pace Delta:</strong>{" "}
              {result.driver_delta > 0 ? "+" : ""}
              {result.driver_delta.toFixed(2)} s / lap
            </p>
          )}

          {/* BEST STRATEGY */}
          {result?.best_strategy && (
            <div className="strategy-box">
              <h3>🏁 Best Strategy</h3>

              {result.best_strategy.strategy.map((stint, i) => (
                <p key={i}>
                  {stint.compound} — {stint.length} laps
                </p>
              ))}

              <p>
                <strong>Total Time:</strong>{" "}
                {result.best_strategy.total_time}s
              </p>

              <StrategyTimeline
                strategy={result.best_strategy.strategy}
                totalLaps={result.track_laps}
              />
            </div>
          )}

          {/* TOP 5 STRATEGIES */}
          {result?.top_5_strategies && (
            <div className="top-strategies">
              <h4>📊 Top 5 Strategies</h4>

              {result.top_5_strategies.map((s, i) => (
                <div key={i} className="strategy-card">
                  <h5>Strategy #{i + 1}</h5>
                  <p className="strategy-time">⏱ {s.total_time}s</p>

                  <StrategyTimeline
                    strategy={s.strategy}
                    totalLaps={result.track_laps}
                  />
                </div>
              ))}
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