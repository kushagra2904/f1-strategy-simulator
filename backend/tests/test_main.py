"""Backend test suite (review item #14).

Covers the pure strategy-simulation helpers and the FastAPI endpoints in
`main.py`. The helper tests use small hand-built lap-time tables so the expected
race times are obvious by inspection; the endpoint tests use FastAPI's
TestClient against the real loaded model.

Run from the backend/ directory:
    ./.venv/bin/python -m pytest
"""

import numpy as np
import pytest
from fastapi.testclient import TestClient

import main
from main import (
    SC_DEPLOY_TAIL,
    SC_MULTIPLIER,
    SC_PIT_LOSS_FACTOR,
    TOP_N,
    TRACK_CONFIG,
    DRIVERS,
    app,
    build_lap_time_table,
    generate_safety_car_periods,
    generate_strategies,
    simulate_strategy,
)

client = TestClient(app)


# ---------------------------------------------------------------------------
# generate_safety_car_periods
# ---------------------------------------------------------------------------

def test_safety_car_deterministic_for_same_seed():
    a = generate_safety_car_periods(57, 0.3, np.random.default_rng(123))
    b = generate_safety_car_periods(57, 0.3, np.random.default_rng(123))
    assert a == b


def test_safety_car_none_when_prob_zero():
    assert generate_safety_car_periods(57, 0.0, np.random.default_rng(1)) == []


def test_safety_car_periods_within_track_bounds():
    total = 50
    periods = generate_safety_car_periods(total, 0.5, np.random.default_rng(7))
    for start, end in periods:
        assert 1 <= start <= end <= total


def test_safety_car_not_deployed_in_closing_laps():
    total = 50
    # prob 1.0 forces an SC at every eligible lap, exercising the tail guard
    periods = generate_safety_car_periods(total, 1.0, np.random.default_rng(3))
    for start, _ in periods:
        assert start <= total - SC_DEPLOY_TAIL


# ---------------------------------------------------------------------------
# build_lap_time_table
# ---------------------------------------------------------------------------

def _track_code(name="Monaco"):
    return int(main.track_encoder.transform([name])[0])


def test_lap_time_table_shape_and_padding():
    total = 12
    table = build_lap_time_table(total, driver_delta=0.0, track_encoded=_track_code())
    for compound in main.compound_encoder.classes_:
        arr = table[compound]
        assert arr.shape == (total + 1, total + 1)
        # index 0 on both axes is padding and must stay zero
        assert np.all(arr[0, :] == 0)
        assert np.all(arr[:, 0] == 0)
        # the valid region carries real (positive) lap-time predictions
        assert np.all(arr[1:, 1:] > 0)


def test_lap_time_table_applies_driver_delta():
    code = _track_code()
    base = build_lap_time_table(10, driver_delta=0.0, track_encoded=code)
    shifted = build_lap_time_table(10, driver_delta=5.0, track_encoded=code)
    for compound in base:
        diff = shifted[compound][1:, 1:] - base[compound][1:, 1:]
        assert np.allclose(diff, 5.0)


def test_lap_time_table_differs_by_circuit():
    # the whole point of the track feature: different circuits -> different pace
    monaco = build_lap_time_table(10, driver_delta=0.0, track_encoded=_track_code("Monaco"))
    monza = build_lap_time_table(10, driver_delta=0.0, track_encoded=_track_code("Monza"))
    # at least one compound's lap-time surface must differ between circuits
    assert any(
        not np.allclose(monaco[c][1:, 1:], monza[c][1:, 1:]) for c in monaco
    )


# ---------------------------------------------------------------------------
# simulate_strategy
# ---------------------------------------------------------------------------

def _ones_table(total_laps, compounds=("A", "B")):
    """A lap-time table where every valid (lap, age) cell costs 1.0 second."""
    arr = np.ones((total_laps + 1, total_laps + 1))
    arr[0, :] = 0
    arr[:, 0] = 0
    return {c: arr.copy() for c in compounds}


def test_simulate_single_stint_no_pit_no_sc():
    total = 10
    table = _ones_table(total)
    mask = np.zeros(total + 1, dtype=bool)
    race_time = simulate_strategy(
        [{"compound": "A", "length": 10}], mask, total, pit_loss=20, lap_time_table=table
    )
    assert race_time == 10.0  # 10 laps * 1.0s, no pit stop added


def test_simulate_two_stints_adds_one_pit_loss():
    total = 10
    table = _ones_table(total)
    mask = np.zeros(total + 1, dtype=bool)
    race_time = simulate_strategy(
        [{"compound": "A", "length": 5}, {"compound": "B", "length": 5}],
        mask, total, pit_loss=20, lap_time_table=table,
    )
    assert race_time == 10.0 + 20  # two 5-lap stints + one pit stop


def test_simulate_applies_safety_car_multiplier():
    total = 10
    table = _ones_table(total)
    mask = np.zeros(total + 1, dtype=bool)
    mask[3:6] = True  # laps 3,4,5 under safety car
    race_time = simulate_strategy(
        [{"compound": "A", "length": 10}], mask, total, pit_loss=20, lap_time_table=table
    )
    # 7 green laps + 3 SC laps at the multiplier
    assert race_time == pytest.approx(7 + 3 * SC_MULTIPLIER)


def test_simulate_discounts_pit_loss_under_safety_car():
    total = 10
    table = _ones_table(total)
    mask = np.zeros(total + 1, dtype=bool)
    mask[5] = True  # the pit-in lap (last lap of a 5-lap first stint) is under SC
    race_time = simulate_strategy(
        [{"compound": "A", "length": 5}, {"compound": "B", "length": 5}],
        mask, total, pit_loss=20, lap_time_table=table,
    )
    # 4 green + 1 SC lap in stint 1, 5 green in stint 2, discounted pit stop
    expected = 4 + SC_MULTIPLIER + 5 + 20 * SC_PIT_LOSS_FACTOR
    assert race_time == pytest.approx(expected)


def test_simulate_full_pit_loss_when_stop_is_green():
    total = 10
    table = _ones_table(total)
    mask = np.zeros(total + 1, dtype=bool)
    mask[8] = True  # SC is out, but NOT on the pit-in lap (lap 5)
    race_time = simulate_strategy(
        [{"compound": "A", "length": 5}, {"compound": "B", "length": 5}],
        mask, total, pit_loss=20, lap_time_table=table,
    )
    # lap 8 (stint 2) is slowed, but the stop itself pays full price
    expected = 5 + (4 + SC_MULTIPLIER) + 20
    assert race_time == pytest.approx(expected)


def test_simulate_truncates_overflowing_final_stint():
    total = 10
    table = _ones_table(total)
    mask = np.zeros(total + 1, dtype=bool)
    # stints sum to 16 but the race is only 10 laps long
    race_time = simulate_strategy(
        [{"compound": "A", "length": 8}, {"compound": "B", "length": 8}],
        mask, total, pit_loss=20, lap_time_table=table,
    )
    assert race_time == 10.0 + 20  # 8 + 2 capped laps + one pit stop


# ---------------------------------------------------------------------------
# generate_strategies
# ---------------------------------------------------------------------------

def test_generated_strategies_use_two_distinct_compounds_and_fill_race():
    total = 57
    strategies = generate_strategies(total)
    assert strategies, "expected at least one strategy"
    for strat in strategies:
        compounds = {s["compound"] for s in strat}
        assert len(compounds) >= 2, "dry-race rule: >= 2 distinct compounds"
        assert all(s["length"] > 0 for s in strat)
        assert sum(s["length"] for s in strat) == total
        assert len(strat) in (2, 3)  # 1-stop or 2-stop only


# ---------------------------------------------------------------------------
# endpoints
# ---------------------------------------------------------------------------

def test_root_endpoint():
    resp = client.get("/")
    assert resp.status_code == 200
    assert "message" in resp.json()


def test_drivers_endpoint_matches_roster():
    resp = client.get("/drivers")
    assert resp.status_code == 200
    body = resp.json()
    assert len(body) == len(DRIVERS)
    assert all({"id", "name"} <= d.keys() for d in body)


def test_tracks_endpoint_shape():
    resp = client.get("/tracks")
    assert resp.status_code == 200
    body = resp.json()
    assert len(body) == len(TRACK_CONFIG)
    assert all({"name", "file", "laps"} <= t.keys() for t in body)


def test_optimize_valid_request_structure():
    resp = client.post(
        "/optimize",
        json={"driver": "Max Verstappen", "track": "Monaco", "seed": 99},
    )
    assert resp.status_code == 200
    body = resp.json()
    assert body["seed"] == 99
    assert body["track_laps"] == TRACK_CONFIG["Monaco"]["laps"]
    assert len(body["top_5_strategies"]) == TOP_N
    # results are sorted ascending and the best matches the front of the list
    times = [r["total_time"] for r in body["top_5_strategies"]]
    assert times == sorted(times)
    assert body["best_strategy"] == body["top_5_strategies"][0]
    assert body["top_5_strategies"][0]["delta_to_best"] == 0.0


def test_optimize_is_deterministic_for_same_seed():
    payload = {"driver": "Lando Norris", "track": "Bahrain", "seed": 2024}
    first = client.post("/optimize", json=payload).json()
    second = client.post("/optimize", json=payload).json()
    assert first["safety_car_periods"] == second["safety_car_periods"]
    assert first["best_strategy"] == second["best_strategy"]


def test_optimize_rejects_unknown_track():
    resp = client.post(
        "/optimize", json={"driver": "Max Verstappen", "track": "Nürburgring"}
    )
    assert resp.status_code == 422


def test_optimize_rejects_unknown_driver():
    resp = client.post(
        "/optimize", json={"driver": "Ayrton Senna", "track": "Monaco"}
    )
    assert resp.status_code == 422
