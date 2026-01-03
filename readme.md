# 🏎️ AI-Based Formula 1 Race Strategy Simulator

An end-to-end **AI-driven race strategy analysis tool for Formula 1** that uses real race data to model tire degradation, simulate pit stop strategies, and compare race outcomes.

This project combines **data science, machine learning, and simulation** to answer a core motorsport question:

> *What is the optimal race strategy given tire wear and pit stop trade-offs?*

---

## 🚀 Project Overview

Modern Formula 1 strategy decisions depend heavily on tire degradation, pit timing, and race evolution. This project recreates a simplified version of that decision-making process using:

- Real Formula 1 race data (via FastF1)
- Machine learning–based tire degradation modeling
- Lap-by-lap race simulation
- Strategy comparison and optimization

The result is a **strategy simulator** that can evaluate multiple race strategies and recommend the best one based on predicted total race time.

---

## 🧠 Key Features

- 📊 **Race Data Extraction**: Loads real race lap data using the FastF1 Python library
- 🛞 **Tire Degradation Model**: Predicts lap time degradation based on tire age, compound, and race progression
- 🔁 **Lap-by-Lap Race Simulation**: Simulates full races including pit stop time loss
- 📈 **Strategy Comparison**: Evaluates multiple strategies and ranks them by total race time
- 📁 **Frontend-Ready Outputs**: Exports clean CSV results for dashboards or web applications

---

## 🏗️ Project Structure

```
f1-strategy-simulator/
├── notebooks/
│   ├── 01_fastf1_exploration.ipynb
│   ├── 02_tire_degradation_model.ipynb
│   └── 03_strategy_simulation.ipynb
│
├── data/
│   └── clean_laps.csv
│
├── models/
│   ├── tire_degradation_model.pkl
│   └── compound_encoder.pkl
│
├── outputs/
│   └── strategy_results.csv
│
└── README.md
```

---

## 🧪 Notebooks Explained

### 1️⃣ `01_fastf1_exploration.ipynb`
- Loads race session data
- Cleans and filters lap-level data
- Explores tire strategies and stint behavior
- Exports a clean dataset for modeling

### 2️⃣ `02_tire_degradation_model.ipynb`
- Engineers tire age and lap features
- Trains a machine learning model to predict lap times
- Analyzes degradation behavior per compound
- Saves trained model artifacts for reuse

### 3️⃣ `03_strategy_simulation.ipynb`
- Loads trained ML models
- Simulates full races lap-by-lap
- Applies pit stop strategies
- Compares strategies and recommends the best one

---

## 🤖 Machine Learning Details

- **Model**: Random Forest Regressor
- **Target**: Lap time (seconds)
- **Key Features**:
  - Tire age (laps)
  - Lap number
  - Tire compound (encoded)

The model captures both **performance differences between compounds** and **degradation trends over a stint**.

---

## 📊 Sample Output

Example strategy comparison output (`strategy_results.csv`):

| Strategy | TotalTimeSeconds | DeltaToBest |
|--------|------------------|-------------|
| Balanced 2-Stop | 5663.4 | 0.0 |
| Aggressive 1-Stop | 5671.2 | +7.8 |
| Conservative | 5685.6 | +22.2 |

---

## 🛠️ Tech Stack

- **Python**
- **FastF1** – Formula 1 timing & telemetry data
- **Pandas / NumPy** – Data processing
- **Scikit-learn** – Machine learning
- **Matplotlib / Seaborn** – Visualization
- **Joblib** – Model persistence

---

## 🎯 Use Cases

- Formula 1 strategy analysis
- Sports analytics projects
- Machine learning + simulation demos
- Data science portfolios
- Interactive dashboards (future frontend)

---

## 🔮 Future Improvements

- Safety Car & Virtual Safety Car simulation
- Driver-specific degradation models
- Weather-aware strategy decisions
- Automatic strategy optimization
- FastAPI backend for real-time simulations
- Interactive web frontend (React)

---

## 📄 CV Description

**AI-Based Formula 1 Race Strategy Simulator**  
Built an AI-driven Formula 1 race strategy simulator using real race data to model tire degradation, simulate pit strategies, and compare race outcomes through lap-by-lap simulation.

---

## 📌 Disclaimer

This project is for **educational and analytical purposes only** and is not affiliated with Formula 1, FIA, or any F1 team.

---

⭐ If you like this project, feel free to fork it, extend it, or build a frontend on top of it!

