from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
import numpy as np
import pandas as pd
import joblib
import os

# ---------------------------
# APP INITIALIZATION
# ---------------------------

app = FastAPI(
    title="AI-Based F1 Strategy Simulator",
    description="Backend API for Formula 1 race strategy optimization",
    version="2.3"
)

# ---------------------------
# CORS (FIXED FOR VERCEL + RENDER)
# ---------------------------

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],          # allow ALL Vercel preview + prod URLs
    allow_credentials=False,      # MUST be False with "*"
    allow_methods=["*"],
    allow_headers=["*"],
)

# Explicit OPTIONS handler (preflight safety)
@app.options("/{path:path}")
def options_handler(path: str):
    return JSONResponse(status_code=200)

# ---------------------------
# TRACK CONFIGURATION
# ---------------------------

TRACK_CONFIG = {
    "Bahrain": {"laps": 57, "sc_prob": 0.04, "pit_loss": 24},
    "Saudi Arabia (Jeddah)": {"laps": 50, "sc_prob": 0.08, "pit_loss": 20},
    "Australia (Albert Park)": {"laps": 58, "sc_prob": 0.07, "pit_loss": 20},
    "Japan (Suzuka)": {"laps": 53, "sc_prob": 0.06, "pit_loss": 22},
    "China (Shanghai)": {"laps": 56, "sc_prob": 0.05, "pit_loss": 23},
    "Miami": {"laps": 57, "sc_prob": 0.06, "pit_loss": 21},
    "Emilia Romagna (Imola)": {"laps": 63, "sc_prob": 0.06, "pit_loss": 21},
    "Monaco": {"laps": 78, "sc_prob": 0.12, "pit_loss": 18},
    "Canada (Montreal)": {"laps": 70, "sc_prob": 0.09, "pit_loss": 19},
    "Spain (Barcelona)": {"laps": 66, "sc_prob": 0.04, "pit_loss": 22},
    "Austria (Spielberg)": {"laps": 71, "sc_prob": 0.05, "pit_loss": 20},
    "Great Britain (Silverstone)": {"laps": 52, "sc_prob": 0.06, "pit_loss": 21},
    "Hungary (Budapest)": {"laps": 70, "sc_prob": 0.05, "pit_loss": 20},
    "Belgium (Spa)": {"laps": 44, "sc_prob": 0.07, "pit_loss": 23},
    "Netherlands (Zandvoort)": {"laps": 72, "sc_prob": 0.06, "pit_loss": 20},
    "Italy (Monza)": {"laps": 53, "sc_prob": 0.04, "pit_loss": 23},
    "Azerbaijan (Baku)": {"laps": 51, "sc_prob": 0.10, "pit_loss": 19},
    "Singapore": {"laps": 62, "sc_prob": 0.12, "pit_loss": 18},
    "United States (COTA)": {"laps": 56, "sc_prob": 0.05, "pit_loss": 23},
    "Mexico": {"laps": 71, "sc_prob": 0.04, "pit_loss": 24},
    "Brazil (Interlagos)": {"laps": 71, "sc_prob": 0.08, "pit_loss": 20},
    "Las Vegas": {"laps": 50, "sc_prob": 0.06, "pit_loss": 22},
    "Qatar (Lusail)": {"laps": 57, "sc_prob": 0.03, "pit_loss": 25},
    "Abu Dhabi (Yas Marina)": {"laps": 58, "sc_prob": 0.04, "pit_loss": 24},
}

DEFAULT_TRACK = {"laps": 52, "sc_prob": 0.05, "pit_loss": 22}

# ---------------------------
# DRIVER PACE DELTAS
# ---------------------------

DRIVER_PACE_DELTA = {
    "Max Verstappen": -0.35,
    "Sergio Pérez": -0.12,
    "Lewis Hamilton": -0.15,
    "George Russell": -0.13,
    "Charles Leclerc": -0.16,
    "Carlos Sainz": -0.14,
    "Lando Norris": -0.18,
    "Oscar Piastri": -0.17,
    "Fernando Alonso": -0.12,
    "Lance Stroll": 0.08,
    "Pierre Gasly": -0.05,
    "Esteban Ocon": -0.06,
    "Alex Albon": -0.04,
    "Logan Sargeant": 0.25,
    "Yuki Tsunoda": -0.07,
    "Daniel Ricciardo": -0.03,
    "Valtteri Bottas": 0.02,
    "Zhou Guanyu": 0.06,
    "Nico Hülkenberg": -0.01,
    "Kevin Magnussen": 0.04,
}

# ---------------------------
# LOAD MODELS
# ---------------------------

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_DIR = os.path.join(BASE_DIR, "models")

model = joblib.load(os.path.join(MODEL_DIR, "tire_degradation_model.pkl"))
compound_encoder = joblib.load(os.path.join(MODEL_DIR, "compound_encoder.pkl"))

# ---------------------------
# REQUEST MODEL
# ---------------------------

class OptimizeRequest(BaseModel):
    driver: str
    track: str

# ---------------------------
# HELPERS
# ---------------------------

def generate_safety_car_periods(total_laps, sc_prob):
    sc_periods = []
    lap = 1
    while lap <= total_laps:
        if np.random.rand() < sc_prob:
            duration = np.random.randint(3, 6)
            sc_periods.append((lap, min(lap + duration, total_laps)))
            lap += duration
        else:
            lap += 1
    return sc_periods


def simulate_strategy(strategy, sc_periods, total_laps, pit_loss, driver_delta):
    race_time = 0.0
    lap_ptr = 1

    for i, stint in enumerate(strategy):
        enc = compound_encoder.transform([stint["compound"]])[0]
        tire_age = 0

        for _ in range(stint["length"]):
            if lap_ptr > total_laps:
                break

            tire_age += 1
            X = pd.DataFrame({
                "TireAge": [tire_age],
                "LapNumber": [lap_ptr],
                "CompoundEncoded": [enc]
            })

            lap_time = model.predict(X)[0] + driver_delta
            if any(s <= lap_ptr <= e for s, e in sc_periods):
                lap_time *= 1.3

            race_time += lap_time
            lap_ptr += 1

        if i < len(strategy) - 1:
            race_time += pit_loss

    return round(race_time, 2)

# ---------------------------
# ENDPOINTS
# ---------------------------

@app.get("/")
def home():
    return {"message": "F1 Strategy Simulator API running"}

@app.post("/optimize")
def optimize(req: OptimizeRequest):
    cfg = TRACK_CONFIG.get(req.track, DEFAULT_TRACK)

    total_laps = cfg["laps"]
    sc_periods = generate_safety_car_periods(total_laps, cfg["sc_prob"])
    driver_delta = DRIVER_PACE_DELTA.get(req.driver, 0.0)

    strategies = []
    for pit in range(12, total_laps - 12, 8):
        strategies.append([
            {"compound": "SOFT", "length": pit},
            {"compound": "HARD", "length": total_laps - pit}
        ])

    results = []
    for strat in strategies[:20]:
        results.append({
            "strategy": strat,
            "total_time": simulate_strategy(
                strat, sc_periods, total_laps, cfg["pit_loss"], driver_delta
            )
        })

    results.sort(key=lambda x: x["total_time"])

    return {
        "track": req.track,
        "track_laps": total_laps,   # ✅ REQUIRED BY FRONTEND
        "driver": req.driver,
        "driver_delta": driver_delta,
        "safety_car_periods": sc_periods,
        "best_strategy": results[0],
        "top_5_strategies": results[:5],
    }

# ---------------------------
# ENTRY POINT (RENDER SAFE)
# ---------------------------

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 10000))
    uvicorn.run(app, host="0.0.0.0", port=port)