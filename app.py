from flask import Flask, render_template, request, jsonify
import json
import random
import math

app = Flask(__name__)

MEDICATIONS = {
    "metformin": {
        "name": "Metformin",
        "type": "Type 2 Diabetes",
        "dosing": "Twice daily with meals",
        "half_life": 6.2,
        "food_sensitive": True,
        "timing_critical": True,
        "base_adherence": 0.71,
        "conflicts": ["alcohol", "contrast_dye", "high_carb_fasting"],
        "gi_risk": 0.62,
    },
    "sertraline": {
        "name": "Sertraline (Zoloft)",
        "type": "Antidepressant / SSRI",
        "dosing": "Once daily",
        "half_life": 26,
        "food_sensitive": False,
        "timing_critical": False,
        "base_adherence": 0.65,
        "conflicts": ["alcohol", "tryptophan", "MAOIs"],
        "gi_risk": 0.3,
    },
    "sumatriptan": {
        "name": "Sumatriptan",
        "type": "Migraine",
        "dosing": "As needed at onset",
        "half_life": 2.5,
        "food_sensitive": False,
        "timing_critical": True,
        "base_adherence": 0.58,
        "conflicts": ["caffeine_excess", "MAOIs", "ergotamine"],
        "gi_risk": 0.2,
    },
    "lisinopril": {
        "name": "Lisinopril",
        "type": "Blood Pressure (ACE Inhibitor)",
        "dosing": "Once daily",
        "half_life": 12,
        "food_sensitive": False,
        "timing_critical": False,
        "base_adherence": 0.68,
        "conflicts": ["potassium_supplements", "NSAIDs", "alcohol"],
        "gi_risk": 0.15,
    },
    "levothyroxine": {
        "name": "Levothyroxine",
        "type": "Thyroid (Hypothyroidism)",
        "dosing": "Once daily, 30-60 min before food",
        "half_life": 168,
        "food_sensitive": True,
        "timing_critical": True,
        "base_adherence": 0.73,
        "conflicts": ["calcium", "coffee", "high_fiber", "antacids"],
        "gi_risk": 0.1,
    },
}

LIFESTYLE_PERSONAS = {
    "night_shift_worker": "Night Shift Worker",
    "student": "University Student",
    "truck_driver": "Long-Haul Truck Driver",
    "office_worker": "Office Professional",
    "athlete": "Competitive Athlete",
    "parent_young_children": "Parent (Young Children)",
    "ramadan_observer": "Ramadan Observer",
    "frequent_traveler": "Frequent Business Traveler",
    "remote_worker": "Remote Worker",
    "retiree": "Retiree",
}


def simulate_adherence(med_id, lifestyle_data):
    med = MEDICATIONS.get(med_id, MEDICATIONS["metformin"])
    base = med["base_adherence"]
    risk_factors = []
    modifiers = []

    sleep_hours = lifestyle_data.get("sleep_hours", 7)
    work_schedule = lifestyle_data.get("work_schedule", "standard")
    caffeine = lifestyle_data.get("caffeine_cups", 2)
    exercise = lifestyle_data.get("exercise_days", 3)
    stress = lifestyle_data.get("stress_level", 5)
    travel = lifestyle_data.get("travel_days_month", 4)
    fasting = lifestyle_data.get("fasting_practice", False)
    alcohol = lifestyle_data.get("alcohol_drinks_week", 3)
    screen_time = lifestyle_data.get("screen_time_hours", 6)

    if work_schedule == "night_shift":
        base -= 0.12
        risk_factors.append({
            "factor": "Night Shift Schedule",
            "impact": -12,
            "insight": "Circadian disruption causes 43% of night workers to miss Dose 2",
            "severity": "high"
        })
    elif work_schedule == "irregular":
        base -= 0.08
        risk_factors.append({
            "factor": "Irregular Work Hours",
            "impact": -8,
            "insight": "Unpredictable schedules create dosing time ambiguity",
            "severity": "medium"
        })

    if travel > 6:
        base -= 0.09
        risk_factors.append({
            "factor": "Frequent Travel",
            "impact": -9,
            "insight": "Time zone shifts disrupt medication timing; 31% forget meds during travel",
            "severity": "high"
        })

    if stress > 7:
        base -= 0.07
        risk_factors.append({
            "factor": "High Stress Load",
            "impact": -7,
            "insight": "Cognitive overload reduces medication recall by 28%",
            "severity": "medium"
        })

    if fasting and med["food_sensitive"]:
        base -= 0.15
        risk_factors.append({
            "factor": "Fasting Practice + Food-Sensitive Medication",
            "impact": -15,
            "insight": "Fasting periods create dangerous dosing windows — patients delay or skip",
            "severity": "high"
        })
    elif fasting:
        base -= 0.05
        risk_factors.append({
            "factor": "Fasting Practice",
            "impact": -5,
            "insight": "Fasting shifts medication timing unpredictably",
            "severity": "low"
        })

    if caffeine > 4:
        if "caffeine_excess" in med.get("conflicts", []):
            base -= 0.06
            risk_factors.append({
                "factor": "Heavy Caffeine Consumption",
                "impact": -6,
                "insight": f"High caffeine intake directly conflicts with {med['name']}",
                "severity": "high"
            })
        else:
            base -= 0.02
            risk_factors.append({
                "factor": "Heavy Caffeine Consumption",
                "impact": -2,
                "insight": "Anxiety symptoms may be amplified; some patients self-discontinue",
                "severity": "low"
            })

    if alcohol > 7 and "alcohol" in med.get("conflicts", []):
        base -= 0.11
        risk_factors.append({
            "factor": "Alcohol Consumption + Drug Interaction",
            "impact": -11,
            "insight": f"Alcohol directly interacts with {med['name']} — serious safety risk",
            "severity": "high"
        })
    elif alcohol > 7:
        base -= 0.04

    if sleep_hours < 6:
        base -= 0.06
        risk_factors.append({
            "factor": "Sleep Deprivation",
            "impact": -6,
            "insight": "Sleep-deprived patients forget morning doses 2x more often",
            "severity": "medium"
        })

    if exercise > 5 and med["type"] in ["Migraine", "Blood Pressure (ACE Inhibitor)"]:
        modifiers.append({
            "factor": "High Exercise Frequency",
            "impact": +4,
            "insight": "Active patients show better condition management but may skip doses on workout days",
            "severity": "positive"
        })
        base += 0.02

    adherence_score = max(0.20, min(0.97, base))

    missed_per_month = round((1 - adherence_score) * 60)
    friction_events = []

    if work_schedule == "night_shift":
        friction_events.append(
            "Dose 2 missed during sleep window (post-shift)")
    if fasting:
        friction_events.append("Timing shift during fasting period")
    if travel > 6:
        friction_events.append("Time zone-induced dosing gaps")
    if caffeine > 4 and "caffeine_excess" in med.get("conflicts", []):
        friction_events.append(
            "Caffeine interaction symptoms → self-discontinuation risk")
    if stress > 7:
        friction_events.append(
            "Stress-period dose forgetting (exams, deadlines)")

    weekly_pattern = []
    for day in ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]:
        day_adherence = adherence_score
        if day in ["Sat", "Sun"] and work_schedule == "standard":
            day_adherence += 0.05
        if day in ["Fri", "Sat"] and alcohol > 5:
            day_adherence -= 0.08
        weekly_pattern.append({
            "day": day,
            "adherence": round(min(0.99, max(0.1, day_adherence + random.uniform(-0.04, 0.04))), 2)
        })

    return {
        "adherence_score": round(adherence_score * 100, 1),
        "missed_doses_monthly": missed_per_month,
        "risk_factors": risk_factors,
        "positive_factors": modifiers,
        "friction_events": friction_events,
        "weekly_pattern": weekly_pattern,
        "medication": med,
        "usability_score": round(adherence_score * 100 - len(risk_factors) * 2, 1),
    }


def generate_demographic_heatmap(med_id):
    groups = [
        {"group": "Night Shift Workers", "adherence": 58, "risk": "high"},
        {"group": "Students (Exam Period)", "adherence": 51, "risk": "high"},
        {"group": "Truck Drivers", "adherence": 61, "risk": "high"},
        {"group": "Ramadan Observers", "adherence": 56, "risk": "high"},
        {"group": "Frequent Travelers", "adherence": 64, "risk": "medium"},
        {"group": "Heavy Coffee Drinkers", "adherence": 69, "risk": "medium"},
        {"group": "Athletes (Competition)", "adherence": 72, "risk": "medium"},
        {"group": "Retirees", "adherence": 81, "risk": "low"},
        {"group": "Office Workers", "adherence": 76, "risk": "low"},
        {"group": "Remote Workers", "adherence": 74, "risk": "low"},
    ]
    med = MEDICATIONS.get(med_id, MEDICATIONS["metformin"])
    if med["food_sensitive"]:
        for g in groups:
            if g["group"] == "Ramadan Observers":
                g["adherence"] = 44
                g["risk"] = "critical"
    return groups


@app.route("/")
def index():
    return render_template("index.html", medications=MEDICATIONS, personas=LIFESTYLE_PERSONAS)


@app.route("/simulate", methods=["POST"])
def simulate():
    data = request.get_json()
    med_id = data.get("medication", "metformin")
    lifestyle = data.get("lifestyle", {})
    result = simulate_adherence(med_id, lifestyle)
    result["demographic_heatmap"] = generate_demographic_heatmap(med_id)
    return jsonify(result)


@app.route("/pharma-dashboard")
def pharma_dashboard():
    return render_template("dashboard.html", medications=MEDICATIONS)


@app.route("/api/medication/<med_id>/overview")
def medication_overview(med_id):
    med = MEDICATIONS.get(med_id)
    if not med:
        return jsonify({"error": "Not found"}), 404
    heatmap = generate_demographic_heatmap(med_id)
    packaging_recs = [
        "Add second-dose reminder blister with embedded NFC chip",
        "Include travel pouch with timezone adjustment card",
        "Color-code AM/PM doses with distinct pill colors",
        "Add 'take with food' embossed reminder on foil backing",
    ] if med["food_sensitive"] else [
        "Add one-touch push-through packaging for elderly users",
        "Include 7-day strip with day indicators",
        "Offer compact travel blister (5-day supply)",
    ]
    return jsonify({
        "medication": med,
        "heatmap": heatmap,
        "packaging_recommendations": packaging_recs,
        "average_adherence": round(sum(g["adherence"] for g in heatmap) / len(heatmap), 1),
        "highest_risk_group": min(heatmap, key=lambda x: x["adherence"])["group"],
    })


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
