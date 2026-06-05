"""Multi-race retraining for the tire-degradation model (review item #10).

The original artifacts (`models/tire_degradation_model.pkl`,
`models/compound_encoder.pkl`) were trained on a SINGLE race (2023 British GP)
in `Notebooks/02_tire_degradation_model.ipynb`. A one-race fit overfits to one
circuit's surface, temperature and layout, so degradation predictions for other
tracks are weak.

This script reproduces that notebook's exact feature pipeline and model
hyperparameters, but trains on MANY races at once. Run it to regenerate the
THREE `.pkl` files in `models/` (model, compound_encoder, track_encoder).

Feature pipeline:
    features = [TireAge, LapNumber, CompoundEncoded, TrackEncoded]
    target   = LapTimeSeconds
    - keep only SOFT / MEDIUM / HARD laps
    - keep only accurate laps (FastF1 `IsAccurate`)
    - TireAge = lap position within each (Driver, Stint), 1-based, PER RACE
    - Compound -> CompoundEncoded via sklearn LabelEncoder
    - Location (circuit) -> TrackEncoded via sklearn LabelEncoder, so the model
      can distinguish circuits instead of averaging their pace into the error
    model = RandomForestRegressor(n_estimators=200, max_depth=10,
                                  random_state=42, n_jobs=-1)

IMPORTANT — scikit-learn version: load-time compatibility of the pickled model
is pinned to scikit-learn 1.6.1 in requirements.txt. Run this script in the same
environment as the backend (the backend `.venv`, which has sklearn 1.6.1) so the
regenerated artifacts stay loadable by `main.py` without InconsistentVersionWarning.

Usage:
    # from the backend/ directory, using the backend venv:
    ./.venv/bin/python train_model.py                      # default race set
    ./.venv/bin/python train_model.py --all --year 2025    # whole 2025 calendar
    ./.venv/bin/python train_model.py --races "Bahrain Grand Prix" "Monaco Grand Prix"
    ./.venv/bin/python train_model.py --all --year 2025 --dry-run   # try without saving

Requires fastf1 (NOT a backend runtime dependency — see requirements-train.txt).
"""

from __future__ import annotations

import argparse
import os
import sys
import warnings

import joblib
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder

# --- paths -----------------------------------------------------------------
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_DIR = os.path.join(BASE_DIR, "models")
CACHE_DIR = os.path.join(BASE_DIR, "fastf1_cache")

# --- pipeline constants ----------------------------------------------------
# Extends the original notebook pipeline with a TrackEncoded feature so the
# model can tell circuits apart (base lap pace swings ~75-95s across tracks);
# without it, pooling many races just averages that spread into the error.
VALID_COMPOUNDS = ["SOFT", "MEDIUM", "HARD"]
FEATURES = ["TireAge", "LapNumber", "CompoundEncoded", "TrackEncoded"]
TARGET = "LapTimeSeconds"
RANDOM_STATE = 42
TEST_SIZE = 0.2
RF_PARAMS = dict(n_estimators=200, max_depth=10, random_state=RANDOM_STATE, n_jobs=-1)

# A spread of mostly-dry 2023 races covering varied layouts and surfaces.
# Wet sessions are fine to include: INTERMEDIATE/WET laps are dropped below.
DEFAULT_RACES = [
    "Bahrain Grand Prix",
    "Spanish Grand Prix",
    "Austrian Grand Prix",
    "British Grand Prix",
    "Hungarian Grand Prix",
    "Italian Grand Prix",
    "Japanese Grand Prix",
    "United States Grand Prix",
    "Mexico City Grand Prix",
    "Abu Dhabi Grand Prix",
]


def clean_session_laps(session) -> pd.DataFrame | None:
    """Return one race's laps reduced to the model's columns, or None if the
    race yields no usable rows. TireAge is computed PER RACE so (Driver, Stint)
    keys never collide across events."""
    laps = session.laps
    if laps is None or len(laps) == 0:
        return None

    df = laps.copy()
    df["LapTimeSeconds"] = pd.to_timedelta(df["LapTime"]).dt.total_seconds()

    df = df[df["Compound"].isin(VALID_COMPOUNDS)]
    df = df[df["IsAccurate"] == True]  # noqa: E712 - FastF1 stores a real bool column
    df = df[df["LapTimeSeconds"].notna()]
    if df.empty:
        return None

    df["TireAge"] = df.groupby(["Driver", "Stint"]).cumcount() + 1
    return df[["Driver", "Stint", "LapNumber", "Compound", "LapTimeSeconds", "TireAge"]]


def _enable_cache():
    import fastf1  # imported lazily so the rest of the module imports without it

    os.makedirs(CACHE_DIR, exist_ok=True)
    fastf1.Cache.enable_cache(CACHE_DIR)
    return fastf1


def season_race_rounds(year: int) -> list[int]:
    """Return every championship round number for a season (excludes pre-season
    testing). Used by --all so the full calendar is pulled without hand-typing
    24 race names."""
    fastf1 = _enable_cache()
    schedule = fastf1.get_event_schedule(year, include_testing=False)
    # RoundNumber 0 is testing; real Grands Prix are >= 1. Every round (incl.
    # sprint weekends) has a Race session, so round numbers are enough.
    rounds = sorted(int(r) for r in schedule["RoundNumber"] if int(r) >= 1)
    print(f"{year} calendar: {len(rounds)} races (rounds {rounds[0]}–{rounds[-1]})")
    return rounds


def build_dataset(year: int, races: list) -> pd.DataFrame:
    """Download + clean every requested race and concatenate into one frame.
    `races` items may be FastF1 event names (str) or round numbers (int)."""
    fastf1 = _enable_cache()

    frames: list[pd.DataFrame] = []
    for race in races:
        try:
            session = fastf1.get_session(year, race, "R")
            session.load(telemetry=False, weather=False, messages=False)
        except Exception as exc:  # one bad race shouldn't abort the whole run
            print(f"  ! skipped {year} {race}: {exc}", file=sys.stderr)
            continue

        # Prefer the canonical event name for labelling (works for round-number
        # inputs too); fall back to whatever was passed in. `Location` is the
        # circuit-stable key the model trains on and that main.py maps to.
        try:
            label = str(session.event["EventName"])
            location = str(session.event["Location"])
        except Exception:
            label = str(race)
            location = str(race)

        cleaned = clean_session_laps(session)
        if cleaned is None:
            print(f"  ! skipped {year} {label}: no usable laps", file=sys.stderr)
            continue

        cleaned = cleaned.assign(Race=label, Location=location)
        frames.append(cleaned)
        print(f"  + {year} {label} @ {location}: {len(cleaned)} laps")

    if not frames:
        raise RuntimeError("No races produced usable laps; nothing to train on.")

    data = pd.concat(frames, ignore_index=True)
    print(f"\nCombined dataset: {len(data)} laps across {len(frames)} race(s)")
    print(data["Compound"].value_counts().to_string())
    return data


def train(data: pd.DataFrame):
    """Fit the compound + track encoders and the RandomForest on the combined
    dataset; return (model, compound_encoder, track_encoder, mae)."""
    compound_encoder = LabelEncoder()
    track_encoder = LabelEncoder()
    data = data.copy()
    data["CompoundEncoded"] = compound_encoder.fit_transform(data["Compound"])
    data["TrackEncoded"] = track_encoder.fit_transform(data["Location"])

    X = data[FEATURES]
    y = data[TARGET]
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=TEST_SIZE, random_state=RANDOM_STATE
    )

    model = RandomForestRegressor(**RF_PARAMS)
    model.fit(X_train, y_train)

    mae = mean_absolute_error(y_test, model.predict(X_test))
    print(f"\nHeld-out MAE: {mae:.3f} s")
    print(f"Circuits learned: {len(track_encoder.classes_)}")
    return model, compound_encoder, track_encoder, mae


def save(model, compound_encoder, track_encoder) -> None:
    os.makedirs(MODEL_DIR, exist_ok=True)
    artifacts = {
        "tire_degradation_model.pkl": model,
        "compound_encoder.pkl": compound_encoder,
        "track_encoder.pkl": track_encoder,
    }
    for filename, obj in artifacts.items():
        path = os.path.join(MODEL_DIR, filename)
        joblib.dump(obj, path)
        print(f"Saved -> {path}")


def _warn_on_sklearn_version() -> None:
    import sklearn

    if sklearn.__version__ != "1.6.1":
        warnings.warn(
            f"Training with scikit-learn {sklearn.__version__}, but the backend "
            "pins 1.6.1 (requirements.txt). Artifacts saved here may raise "
            "InconsistentVersionWarning when main.py loads them. Either run this "
            "in the backend venv (sklearn 1.6.1) or update the pin + comment.",
            stacklevel=2,
        )


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--year", type=int, default=2023, help="Season year (default 2023)")
    parser.add_argument(
        "--races",
        nargs="+",
        default=DEFAULT_RACES,
        help="Race names as FastF1 expects them (default: a 10-race 2023 spread)",
    )
    parser.add_argument(
        "--all",
        action="store_true",
        help="Train on the ENTIRE season calendar for --year (overrides --races)",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Build the dataset and train, but do NOT overwrite the .pkl files",
    )
    args = parser.parse_args()

    _warn_on_sklearn_version()

    races = season_race_rounds(args.year) if args.all else args.races
    print(f"Building dataset: {args.year}, {len(races)} race(s)")
    data = build_dataset(args.year, races)
    model, compound_encoder, track_encoder, _ = train(data)

    if args.dry_run:
        print("\n--dry-run: artifacts NOT written.")
        return
    save(model, compound_encoder, track_encoder)


if __name__ == "__main__":
    main()
