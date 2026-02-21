"""
Stateless scoring engine for injury risk, DOMS, strain, and catastrophizing.
All scores 0-100 unless noted. Edge cases applied before final risk level.
"""
import random


def _clamp(value: float, low: float, high: float) -> float:
    return max(low, min(high, value))


def structural_injury_risk(data: dict) -> float:
    score = 0.0
    if data.get("pain_scale", 0) >= 8:
        score += 25
    if data.get("radiates"):
        score += 30
    if data.get("swelling"):
        score += 25
    if data.get("sharp_during_lift"):
        score += 20
    if not data.get("light_load_possible", True):
        score += 20
    if data.get("previous_injury"):
        score += 10
    if data.get("improved_after_warmup"):
        score -= 15
    return _clamp(score, 0, 100)


def doms_probability(data: dict) -> float:
    score = 0.0
    if data.get("onset_timing") == "Next day":
        score += 30
    if data.get("improved_after_warmup"):
        score += 20
    if data.get("pain_type") == "Dull ache":
        score += 20
    if not data.get("swelling"):
        score += 10
    if data.get("pain_scale", 10) <= 6:
        score += 10
    return _clamp(score, 0, 100)


def muscle_strain_score(data: dict) -> float:
    score = 0.0
    if data.get("sharp_during_lift"):
        score += 20
    if data.get("pain_type") == "Localized":
        score += 20
    pain = data.get("pain_scale", 0)
    if 5 <= pain <= 7:
        score += 20
    if not data.get("radiates"):
        score += 10
    if data.get("light_load_possible"):
        score += 10
    return _clamp(score, 0, 100)


def catastrophizing_index(
    data: dict, structural_risk: float
) -> float:
    if (
        structural_risk < 40
        and data.get("pain_scale", 10) <= 6
        and not data.get("swelling")
        and not data.get("radiates")
        and data.get("improved_after_warmup")
    ):
        return random.randint(70, 90)
    return random.randint(20, 40)


def _risk_level(structural_risk: float) -> str:
    if structural_risk >= 70:
        return "RED"
    if structural_risk >= 40:
        return "YELLOW"
    return "GREEN"


def _likely_issue(
    structural_risk: float,
    doms_prob: float,
    strain_score: float,
    catastrophizing: float,
    risk_level: str,
) -> str:
    if risk_level == "RED":
        return "Possible structural concern — get it checked."
    if risk_level == "YELLOW":
        if strain_score >= 50:
            return "Likely muscle strain. Ease off and reassess."
        return "Moderate concern. Avoid heavy loading and reassess in 48h."
    if catastrophizing >= 70:
        return "Likely normal soreness. You are probably fine."
    if doms_prob >= 60:
        return "Delayed onset muscle soreness. This looks like classic post-workout soreness."
    if strain_score >= 40:
        return "Mild strain possible. Light movement and mobility are fine."
    return "Likely normal soreness. Light activity and mobility are okay."


def _recommendations(risk_level: str) -> list:
    if risk_level == "GREEN":
        return [
            "Train a different muscle group today.",
            "Light cardio is fine.",
            "Include mobility work.",
        ]
    if risk_level == "YELLOW":
        return [
            "Avoid heavy compound lifts on this area.",
            "No max effort for 48 hours.",
            "Reassess in 48 hours.",
        ]
    # RED
    return [
        "Stop loading this area.",
        "Consider seeing a physio if it persists.",
        "Avoid aggressive stretching.",
    ]


def _monitor_for(risk_level: str, data: dict) -> list:
    if risk_level == "GREEN":
        monitor = ["Pain getting worse", "New swelling", "Radiating pain"]
    elif risk_level == "YELLOW":
        monitor = ["Increasing swelling", "Radiating pain", "Loss of strength"]
    else:
        monitor = [
            "Increasing swelling",
            "Radiating pain",
            "Loss of strength",
            "Numbness or tingling",
        ]
    if data.get("previous_injury"):
        monitor.append("Re-injury or pain in same spot")
    return monitor


def _google_spiral_probability(
    catastrophizing_index_val: float, structural_risk: float
) -> int:
    if catastrophizing_index_val > 70 and structural_risk < 40:
        return random.randint(85, 95)
    return random.randint(30, 50)


def compute_all(data: dict) -> dict:
    structural_risk = structural_injury_risk(data)
    doms_prob = doms_probability(data)
    strain_score = muscle_strain_score(data)

    # Edge: radiating + swelling + pain >= 8 → RED
    if (
        data.get("radiates")
        and data.get("swelling")
        and data.get("pain_scale", 0) >= 8
    ):
        structural_risk = max(structural_risk, 70)

    # Edge: pain_scale <= 3 → GREEN
    if data.get("pain_scale", 0) <= 3:
        structural_risk = min(structural_risk, 39)

    # Edge: previous_injury + high risk → escalate 10%
    if data.get("previous_injury") and structural_risk >= 40:
        structural_risk = _clamp(structural_risk + 10, 0, 100)

    catastrophizing = catastrophizing_index(data, structural_risk)
    risk_level = _risk_level(structural_risk)

    likely_issue = _likely_issue(
        structural_risk, doms_prob, strain_score, catastrophizing, risk_level
    )
    recommendations = _recommendations(risk_level)
    monitor_for = _monitor_for(risk_level, data)
    google_spiral = _google_spiral_probability(catastrophizing, structural_risk)

    return {
        "risk_level": risk_level,
        "structural_risk": round(structural_risk),
        "doms_probability": round(doms_prob),
        "strain_score": round(strain_score),
        "catastrophizing_index": catastrophizing,
        "likely_issue": likely_issue,
        "recommendations": recommendations,
        "monitor_for": monitor_for,
        "google_spiral_probability": google_spiral,
    }
