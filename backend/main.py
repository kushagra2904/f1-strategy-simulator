from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from itertools import permutations, product
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
    version="2.5"
)

# ---------------------------
# CORS (VERCEL + RENDER SAFE)
# ---------------------------

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],      # allow all Vercel preview + prod URLs
    allow_credentials=False,  # MUST be False with "*"
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.options("/{path:path}")
def options_handler(path: str):
    return JSONResponse(status_code=200)

# ---------------------------
# TRACK CONFIGURATION
# ---------------------------
# `file` is the image asset served by the frontend from /public/tracks/.
# The frontend fetches this list from /tracks so it stays a single source.
# `circuit` is the FastF1 `Location` the tire model was trained on; it maps this
# display name to the TrackEncoded feature (see build_lap_time_table). Every
# circuit here MUST exist in track_encoder.classes_ or prediction will fail.

TRACK_CONFIG = {
    "Bahrain": {"laps": 57, "sc_prob": 0.04, "pit_loss": 24, "file": "bahrain.png", "circuit": "Sakhir"},
    "Saudi Arabia (Jeddah)": {"laps": 50, "sc_prob": 0.08, "pit_loss": 20, "file": "jeddah.png", "circuit": "Jeddah"},
    "Australia (Albert Park)": {"laps": 58, "sc_prob": 0.07, "pit_loss": 20, "file": "albert_park.png", "circuit": "Melbourne"},
    "Japan (Suzuka)": {"laps": 53, "sc_prob": 0.06, "pit_loss": 22, "file": "suzuka.png", "circuit": "Suzuka"},
    "China (Shanghai)": {"laps": 56, "sc_prob": 0.05, "pit_loss": 23, "file": "shanghai.png", "circuit": "Shanghai"},
    "Miami": {"laps": 57, "sc_prob": 0.06, "pit_loss": 21, "file": "miami.png", "circuit": "Miami Gardens"},
    "Emilia Romagna (Imola)": {"laps": 63, "sc_prob": 0.06, "pit_loss": 21, "file": "imola.png", "circuit": "Imola"},
    "Monaco": {"laps": 78, "sc_prob": 0.12, "pit_loss": 18, "file": "monaco.png", "circuit": "Monaco"},
    "Canada (Montreal)": {"laps": 70, "sc_prob": 0.09, "pit_loss": 19, "file": "montreal.png", "circuit": "Montréal"},
    "Spain (Barcelona)": {"laps": 66, "sc_prob": 0.04, "pit_loss": 22, "file": "barcelona.png", "circuit": "Barcelona"},
    "Austria (Spielberg)": {"laps": 71, "sc_prob": 0.05, "pit_loss": 20, "file": "spielberg.png", "circuit": "Spielberg"},
    "Great Britain (Silverstone)": {"laps": 52, "sc_prob": 0.06, "pit_loss": 21, "file": "silverstone.png", "circuit": "Silverstone"},
    "Hungary (Budapest)": {"laps": 70, "sc_prob": 0.05, "pit_loss": 20, "file": "hungary.png", "circuit": "Budapest"},
    "Belgium (Spa)": {"laps": 44, "sc_prob": 0.07, "pit_loss": 23, "file": "spa.png", "circuit": "Spa-Francorchamps"},
    "Netherlands (Zandvoort)": {"laps": 72, "sc_prob": 0.06, "pit_loss": 20, "file": "zandvoort.png", "circuit": "Zandvoort"},
    "Italy (Monza)": {"laps": 53, "sc_prob": 0.04, "pit_loss": 23, "file": "monza.png", "circuit": "Monza"},
    "Azerbaijan (Baku)": {"laps": 51, "sc_prob": 0.10, "pit_loss": 19, "file": "baku.png", "circuit": "Baku"},
    "Singapore": {"laps": 62, "sc_prob": 0.12, "pit_loss": 18, "file": "singapore.png", "circuit": "Marina Bay"},
    "United States (COTA)": {"laps": 56, "sc_prob": 0.05, "pit_loss": 23, "file": "austin.png", "circuit": "Austin"},
    "Mexico": {"laps": 71, "sc_prob": 0.04, "pit_loss": 24, "file": "mexico.png", "circuit": "Mexico City"},
    "Brazil (Interlagos)": {"laps": 71, "sc_prob": 0.08, "pit_loss": 20, "file": "interlagos.png", "circuit": "São Paulo"},
    "Las Vegas": {"laps": 50, "sc_prob": 0.06, "pit_loss": 22, "file": "vegas.png", "circuit": "Las Vegas"},
    "Qatar (Lusail)": {"laps": 57, "sc_prob": 0.03, "pit_loss": 25, "file": "lusail.png", "circuit": "Lusail"},
    "Abu Dhabi (Yas Marina)": {"laps": 58, "sc_prob": 0.04, "pit_loss": 24, "file": "yas_marina.png", "circuit": "Yas Island"},
}

DEFAULT_TRACK = {"laps": 52, "sc_prob": 0.05, "pit_loss": 22, "file": "silverstone.png", "circuit": "Silverstone"}

# ---------------------------
# TEAMS (2026 GRID)
# ---------------------------
# 11 constructors for 2026, including the new Cadillac entry and Sauber's
# rebrand to Audi. `color` is the team's primary livery accent (hex), served via
# /teams so the frontend can theme per team. NOTE: Audi and Cadillac liveries
# were not fully revealed at time of writing — their colors here are provisional.

TEAMS = [
    {"id": "MCL", "name": "McLaren", "color": "#FF8000"},
    {"id": "FER", "name": "Ferrari", "color": "#E8002D"},
    {"id": "RBR", "name": "Red Bull Racing", "color": "#3671C6"},
    {"id": "MER", "name": "Mercedes", "color": "#00D2BE"},
    {"id": "AST", "name": "Aston Martin", "color": "#229971"},
    {"id": "ALP", "name": "Alpine", "color": "#0093CC"},
    {"id": "WIL", "name": "Williams", "color": "#1868DB"},
    {"id": "RB", "name": "Racing Bulls", "color": "#6692FF"},
    {"id": "HAA", "name": "Haas", "color": "#9C9FA2"},
    {"id": "AUD", "name": "Audi", "color": "#00594F"},      # provisional 2026 livery
    {"id": "CAD", "name": "Cadillac", "color": "#B59410"},  # provisional 2026 livery
]

TEAM_COLOR = {t["name"]: t["color"] for t in TEAMS}

# ---------------------------
# DRIVERS (2026 GRID)
# ---------------------------
# `pace_delta` (seconds/lap vs. baseline) is a subjective estimate, NOT an
# authoritative figure — especially for 2026, which brings all-new regulations,
# so the competitive order is highly uncertain. Negative = faster. Single source
# of truth served via /drivers so the frontend never duplicates the roster.

DRIVERS = [
    {"id": "NOR", "name": "Lando Norris", "team": "McLaren", "pace_delta": -0.20},
    {"id": "PIA", "name": "Oscar Piastri", "team": "McLaren", "pace_delta": -0.20},
    {"id": "LEC", "name": "Charles Leclerc", "team": "Ferrari", "pace_delta": -0.16},
    {"id": "HAM", "name": "Lewis Hamilton", "team": "Ferrari", "pace_delta": -0.15},
    {"id": "VER", "name": "Max Verstappen", "team": "Red Bull Racing", "pace_delta": -0.30},
    {"id": "HAD", "name": "Isack Hadjar", "team": "Red Bull Racing", "pace_delta": 0.04},
    {"id": "RUS", "name": "George Russell", "team": "Mercedes", "pace_delta": -0.15},
    {"id": "ANT", "name": "Andrea Kimi Antonelli", "team": "Mercedes", "pace_delta": -0.02},
    {"id": "ALO", "name": "Fernando Alonso", "team": "Aston Martin", "pace_delta": -0.10},
    {"id": "STR", "name": "Lance Stroll", "team": "Aston Martin", "pace_delta": 0.08},
    {"id": "GAS", "name": "Pierre Gasly", "team": "Alpine", "pace_delta": -0.04},
    {"id": "COL", "name": "Franco Colapinto", "team": "Alpine", "pace_delta": 0.10},
    {"id": "ALB", "name": "Alex Albon", "team": "Williams", "pace_delta": -0.05},
    {"id": "SAI", "name": "Carlos Sainz", "team": "Williams", "pace_delta": -0.12},
    {"id": "LAW", "name": "Liam Lawson", "team": "Racing Bulls", "pace_delta": 0.03},
    {"id": "LIN", "name": "Arvid Lindblad", "team": "Racing Bulls", "pace_delta": 0.14},
    {"id": "OCO", "name": "Esteban Ocon", "team": "Haas", "pace_delta": -0.05},
    {"id": "BEA", "name": "Oliver Bearman", "team": "Haas", "pace_delta": 0.05},
    {"id": "HUL", "name": "Nico Hülkenberg", "team": "Audi", "pace_delta": -0.01},
    {"id": "BOR", "name": "Gabriel Bortoleto", "team": "Audi", "pace_delta": 0.10},
    {"id": "BOT", "name": "Valtteri Bottas", "team": "Cadillac", "pace_delta": 0.08},
    {"id": "PER", "name": "Sergio Pérez", "team": "Cadillac", "pace_delta": 0.04},
]

DRIVER_PACE_DELTA = {d["name"]: d["pace_delta"] for d in DRIVERS}

# ---------------------------
# STRATEGY GENERATION TUNABLES
# ---------------------------

COMPOUNDS = ["SOFT", "MEDIUM", "HARD"]
STOP_MIN = 10          # earliest/latest a stop can happen (laps from each end)
ONE_STOP_STEP = 3      # pit-window granularity for 1-stop strategies
TWO_STOP_STEP = 5      # pit-window granularity for 2-stop strategies
TOP_N = 5

# ---------------------------
# SAFETY-CAR MODEL (item #4: realism)
# ---------------------------
# Two distinct effects, both real:
#   1. Under a safety car the field circulates slowly, so each SC lap takes
#      longer than a green lap -> SC_MULTIPLIER (> 1) inflates those lap times.
#   2. THE strategic lever: pitting while the SC is out is much cheaper, because
#      rivals on track are also crawling, so the time lost relative to them in
#      the pit lane shrinks. SC_PIT_LOSS_FACTOR scales pit loss for a stop made
#      during an SC window. Without this the SC is strategically inert (it just
#      adds a near-constant offset to every strategy); with it, the optimiser
#      correctly favours strategies that stop under the safety car.
# A safety car is also not deployed in the final laps of a race (it would simply
# end the race under SC), so generation leaves a tail clear.
SC_MULTIPLIER = 1.3        # SC lap time vs. green (~30% slower)
SC_PIT_LOSS_FACTOR = 0.5   # a stop made under SC costs ~half the normal pit loss
SC_DEPLOY_TAIL = 3         # no new SC deployed within this many laps of the end

# ---------------------------
# LOAD MODELS
# ---------------------------

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_DIR = os.path.join(BASE_DIR, "models")

model = joblib.load(os.path.join(MODEL_DIR, "tire_degradation_model.pkl"))
compound_encoder = joblib.load(os.path.join(MODEL_DIR, "compound_encoder.pkl"))
track_encoder = joblib.load(os.path.join(MODEL_DIR, "track_encoder.pkl"))

# ---------------------------
# REQUEST MODEL
# ---------------------------

class OptimizeRequest(BaseModel):
    driver: str
    track: str
    seed: int | None = None


class StintIn(BaseModel):
    compound: str
    length: int


class TelemetryRequest(BaseModel):
    driver: str
    track: str
    strategy: list[StintIn]
    seed: int | None = None

# ---------------------------
# HELPERS
# ---------------------------

def generate_safety_car_periods(total_laps, sc_prob, rng):
    # A safety car is not newly deployed in the closing laps (it would just run
    # the race out under SC), so stop sampling SC_DEPLOY_TAIL laps from the end.
    last_deploy_lap = total_laps - SC_DEPLOY_TAIL
    sc_periods = []
    lap = 1
    while lap <= last_deploy_lap:
        if rng.random() < sc_prob:
            duration = int(rng.integers(3, 6))
            sc_periods.append((lap, min(lap + duration, total_laps)))
            lap += duration
        else:
            lap += 1
    return sc_periods


def build_lap_time_table(total_laps, driver_delta, track_encoded):
    """Precompute lap_time[compound_idx, lap_number, tire_age] in one batched
    model.predict call. Indices 1..total_laps are valid; index 0 is padding.
    Strategy simulation then sums array slices instead of calling the model
    per stint, so adding many strategies stays cheap. `track_encoded` is the
    circuit's LabelEncoder code, held constant across the whole grid."""
    compounds = list(compound_encoder.classes_)
    laps = np.arange(1, total_laps + 1)
    ages = np.arange(1, total_laps + 1)

    # Cartesian grid of (compound, lap_number, tire_age)
    comp_idx, lap_grid, age_grid = np.meshgrid(
        np.arange(len(compounds)), laps, ages, indexing="ij"
    )
    X = pd.DataFrame({
        "TireAge": age_grid.ravel(),
        "LapNumber": lap_grid.ravel(),
        "CompoundEncoded": compound_encoder.transform(
            [compounds[i] for i in comp_idx.ravel()]
        ),
        "TrackEncoded": track_encoded,
    })
    preds = model.predict(X).reshape(len(compounds), total_laps, total_laps)
    preds += driver_delta

    # Pad to 1-based indexing on the lap/age axes for easy slicing.
    table = np.zeros((len(compounds), total_laps + 1, total_laps + 1))
    table[:, 1:, 1:] = preds
    return {comp: table[i] for i, comp in enumerate(compounds)}


def simulate_strategy(strategy, sc_mask, total_laps, pit_loss, lap_time_table):
    """Sum lap times for a strategy using the precomputed table. `sc_mask` is a
    boolean array indexed by lap number (1-based) marking safety-car laps."""
    race_time = 0.0
    lap_ptr = 1

    for stint_idx, stint in enumerate(strategy):
        remaining = total_laps - lap_ptr + 1
        length = min(stint["length"], remaining)
        if length <= 0:
            break

        table = lap_time_table[stint["compound"]]
        laps = np.arange(lap_ptr, lap_ptr + length)
        ages = np.arange(1, length + 1)
        lap_times = table[laps, ages].copy()

        sc_here = sc_mask[laps]
        lap_times[sc_here] *= SC_MULTIPLIER

        race_time += lap_times.sum()
        pit_lap = lap_ptr + length - 1   # last lap of this stint = the pit-in lap
        lap_ptr += length

        if stint_idx < len(strategy) - 1:
            # Pitting under the safety car is much cheaper (item #4): the field
            # is slowed, so the relative loss in the pit lane shrinks.
            under_sc = bool(sc_mask[pit_lap])
            race_time += pit_loss * (SC_PIT_LOSS_FACTOR if under_sc else 1.0)

    return round(float(race_time), 2)


def per_lap_telemetry(strategy, sc_mask, total_laps, pit_loss, lap_time_table):
    """Walk a strategy lap-by-lap and emit the model's predicted lap time for
    every lap, mirroring simulate_strategy's clamping / safety-car / pit-loss
    logic. Returns (laps, stints) where each lap is a dict and each stint a
    summary. The pit time for a stop is attributed to that stint's pit-in lap so
    the per-lap series sums to the same race time simulate_strategy reports."""
    laps_out = []
    stints_out = []
    lap_ptr = 1

    for stint_idx, stint in enumerate(strategy):
        remaining = total_laps - lap_ptr + 1
        length = min(stint["length"], remaining)
        if length <= 0:
            break

        compound = stint["compound"]
        table = lap_time_table[compound]
        start_lap = lap_ptr
        end_lap = lap_ptr + length - 1
        is_last = stint_idx == len(strategy) - 1

        stint_times = []
        for age in range(1, length + 1):
            lap_no = lap_ptr + age - 1
            sc = bool(sc_mask[lap_no])
            lap_time = float(table[lap_no, age])
            if sc:
                lap_time *= SC_MULTIPLIER

            pit_in = (not is_last) and (lap_no == end_lap)
            pit_time = 0.0
            if pit_in:
                pit_time = pit_loss * (SC_PIT_LOSS_FACTOR if sc else 1.0)

            laps_out.append({
                "lap": lap_no,
                "stint_index": stint_idx,
                "compound": compound,
                "tire_age": age,
                "lap_time": round(lap_time, 3),
                "pit_time": round(float(pit_time), 3),
                "safety_car": sc,
                "pit_in": pit_in,
            })
            stint_times.append(lap_time)

        stints_out.append({
            "stint_index": stint_idx,
            "compound": compound,
            "length": length,
            "start_lap": start_lap,
            "end_lap": end_lap,
            "avg_time": round(float(np.mean(stint_times)), 3),
            "best_time": round(float(np.min(stint_times)), 3),
        })
        lap_ptr += length

    return laps_out, stints_out


def generate_strategies(total_laps):
    """Enumerate 1-stop and 2-stop strategies across all compounds. Dry-race
    rule: at least two distinct compounds must be used."""
    strategies = []

    # 1-stop: every ordered compound pair c1 != c2
    one_stop_window = range(STOP_MIN, total_laps - STOP_MIN, ONE_STOP_STEP)
    for c1, c2 in permutations(COMPOUNDS, 2):
        for pit in one_stop_window:
            strategies.append([
                {"compound": c1, "length": pit},
                {"compound": c2, "length": total_laps - pit},
            ])

    # 2-stop: compound triples using >= 2 distinct compounds
    two_stop_window = list(range(STOP_MIN, total_laps - STOP_MIN, TWO_STOP_STEP))
    for c1, c2, c3 in product(COMPOUNDS, repeat=3):
        if len({c1, c2, c3}) < 2:
            continue
        for p1 in two_stop_window:
            for p2 in two_stop_window:
                if p2 - p1 < STOP_MIN:
                    continue
                strategies.append([
                    {"compound": c1, "length": p1},
                    {"compound": c2, "length": p2 - p1},
                    {"compound": c3, "length": total_laps - p2},
                ])

    return strategies

# ---------------------------
# ENDPOINTS
# ---------------------------

@app.get("/")
def home():
    return {"message": "F1 Strategy Simulator API running"}


@app.get("/drivers")
def get_drivers():
    return [
        {
            "id": d["id"],
            "name": d["name"],
            "team": d["team"],
            "team_color": TEAM_COLOR[d["team"]],
        }
        for d in DRIVERS
    ]


@app.get("/teams")
def get_teams():
    return TEAMS


@app.get("/tracks")
def get_tracks():
    return [
        {"name": name, "file": cfg["file"], "laps": cfg["laps"]}
        for name, cfg in TRACK_CONFIG.items()
    ]


@app.post("/optimize")
def optimize(req: OptimizeRequest):
    # --- validation (item 13): no silent fallbacks ---
    if req.track not in TRACK_CONFIG:
        raise HTTPException(status_code=422, detail=f"Unknown track: {req.track}")
    if req.driver not in DRIVER_PACE_DELTA:
        raise HTTPException(status_code=422, detail=f"Unknown driver: {req.driver}")

    cfg = TRACK_CONFIG[req.track]
    total_laps = cfg["laps"]
    driver_delta = DRIVER_PACE_DELTA[req.driver]

    # Map the track to the circuit the model was trained on (item: track feature)
    if cfg["circuit"] not in track_encoder.classes_:
        raise HTTPException(
            status_code=500,
            detail=f"Track '{req.track}' maps to circuit '{cfg['circuit']}', "
                   "which the model was not trained on. Retrain with this circuit.",
        )
    track_encoded = int(track_encoder.transform([cfg["circuit"]])[0])

    # --- determinism (item 2): seed a local RNG, echo it back ---
    seed = req.seed if req.seed is not None else int(np.random.SeedSequence().entropy % (2**32))
    rng = np.random.default_rng(seed)

    sc_periods = generate_safety_car_periods(total_laps, cfg["sc_prob"], rng)
    sc_mask = np.zeros(total_laps + 1, dtype=bool)
    for start, end in sc_periods:
        sc_mask[start:end + 1] = True

    lap_time_table = build_lap_time_table(total_laps, driver_delta, track_encoded)

    results = []
    for strat in generate_strategies(total_laps):
        results.append({
            "strategy": strat,
            "total_time": simulate_strategy(
                strat, sc_mask, total_laps, cfg["pit_loss"], lap_time_table
            ),
        })

    results.sort(key=lambda x: x["total_time"])
    best_time = results[0]["total_time"]
    for r in results[:TOP_N]:
        r["delta_to_best"] = round(r["total_time"] - best_time, 2)

    return {
        "track": req.track,
        "track_laps": total_laps,
        "driver": req.driver,
        "driver_delta": driver_delta,
        "seed": seed,
        "safety_car_periods": sc_periods,
        "best_strategy": results[0],
        "top_5_strategies": results[:TOP_N],
    }


@app.post("/telemetry")
def telemetry(req: TelemetryRequest):
    # --- validation: mirror /optimize, no silent fallbacks ---
    if req.track not in TRACK_CONFIG:
        raise HTTPException(status_code=422, detail=f"Unknown track: {req.track}")
    if req.driver not in DRIVER_PACE_DELTA:
        raise HTTPException(status_code=422, detail=f"Unknown driver: {req.driver}")
    if not req.strategy:
        raise HTTPException(status_code=422, detail="strategy must have at least one stint")
    for stint in req.strategy:
        if stint.compound not in COMPOUNDS:
            raise HTTPException(status_code=422, detail=f"Unknown compound: {stint.compound}")
        if stint.length <= 0:
            raise HTTPException(status_code=422, detail="stint length must be positive")

    cfg = TRACK_CONFIG[req.track]
    total_laps = cfg["laps"]
    driver_delta = DRIVER_PACE_DELTA[req.driver]

    if cfg["circuit"] not in track_encoder.classes_:
        raise HTTPException(
            status_code=500,
            detail=f"Track '{req.track}' maps to circuit '{cfg['circuit']}', "
                   "which the model was not trained on. Retrain with this circuit.",
        )
    track_encoded = int(track_encoder.transform([cfg["circuit"]])[0])

    # Reuse the caller's seed so safety-car windows match the /optimize result
    # they already hold; otherwise sample a fresh one and echo it back.
    seed = req.seed if req.seed is not None else int(np.random.SeedSequence().entropy % (2**32))
    rng = np.random.default_rng(seed)

    sc_periods = generate_safety_car_periods(total_laps, cfg["sc_prob"], rng)
    sc_mask = np.zeros(total_laps + 1, dtype=bool)
    for start, end in sc_periods:
        sc_mask[start:end + 1] = True

    lap_time_table = build_lap_time_table(total_laps, driver_delta, track_encoded)
    strategy = [{"compound": s.compound, "length": s.length} for s in req.strategy]
    laps, stints = per_lap_telemetry(
        strategy, sc_mask, total_laps, cfg["pit_loss"], lap_time_table
    )

    total_time = round(sum(l["lap_time"] + l["pit_time"] for l in laps), 2)
    fastest = min(laps, key=lambda l: l["lap_time"])

    return {
        "track": req.track,
        "track_laps": total_laps,
        "driver": req.driver,
        "driver_delta": driver_delta,
        "seed": seed,
        "safety_car_periods": sc_periods,
        "laps": laps,
        "stints": stints,
        "total_time": total_time,
        "fastest_lap": fastest["lap_time"],
        "fastest_lap_number": fastest["lap"],
    }

# ---------------------------
# ENTRY POINT (RENDER SAFE)
# ---------------------------

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 10000))
    uvicorn.run(app, host="0.0.0.0", port=port)
