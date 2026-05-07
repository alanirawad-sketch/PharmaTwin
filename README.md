# PharmaTwin — Digital Twin Platform for Medication Reality Simulation

A web platform that simulates how medications behave across different real-world lifestyles —
not just biologically, but practically.

## Quick Start

```bash
pip install -r requirements.txt
python app.py
```

Then open: http://localhost:5000

## Features

- **Lifestyle Simulation Engine** — configure work schedule, sleep, stress, caffeine, alcohol,
  fasting, travel, and more to build a behavioral patient profile
- **Adherence Prediction** — AI-driven score predicting real-world missed doses and friction events
- **Demographic Heatmap** — see which population groups (night workers, Ramadan observers,
  students, athletes) face the highest adherence barriers
- **Pharma Dashboard** (/pharma-dashboard) — B2B portal with medication-level analytics,
  behavioral insights, and packaging recommendations
- **Packaging Intelligence** — data-driven suggestions for blister redesign, smart labels,
  and dosing guidance improvements

## Medications Modeled

- Metformin (Type 2 Diabetes)
- Sertraline / Zoloft (SSRI Antidepressant)
- Sumatriptan (Migraine)
- Lisinopril (Blood Pressure)
- Levothyroxine (Hypothyroidism)

## API Endpoints

- `GET /` — Lifestyle Simulator (patient-facing)
- `POST /simulate` — Run simulation (JSON body: `{medication, lifestyle}`)
- `GET /pharma-dashboard` — Pharma B2B dashboard
- `GET /api/medication/<id>/overview` — Medication-level analytics

## Project Structure

```
pharmatwin/
├── app.py               # Flask app + simulation engine
├── requirements.txt
├── README.md
└── templates/
    ├── index.html       # Lifestyle simulator UI
    └── dashboard.html   # Pharma B2B dashboard
```
