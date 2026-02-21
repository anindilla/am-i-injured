import type { NextRequest } from "next/server";
import type { InjuryInput } from "@/lib/types";

function clamp(value: number, low: number, high: number): number {
  return Math.max(low, Math.min(high, value));
}

function structuralInjuryRisk(data: InjuryInput): number {
  let score = 0;
  if (data.pain_scale >= 8) score += 25;
  if (data.radiates) score += 30;
  if (data.swelling) score += 25;
  if (data.sharp_during_lift) score += 20;
  if (!data.light_load_possible) score += 20;
  if (data.previous_injury) score += 10;
  if (data.improved_after_warmup) score -= 15;
  return clamp(score, 0, 100);
}

function domsProbability(data: InjuryInput): number {
  let score = 0;
  if (data.onset_timing === "Next day") score += 30;
  if (data.improved_after_warmup) score += 20;
  if (data.pain_type === "Dull ache") score += 20;
  if (!data.swelling) score += 10;
  if (data.pain_scale <= 6) score += 10;
  return clamp(score, 0, 100);
}

function muscleStrainScore(data: InjuryInput): number {
  let score = 0;
  if (data.sharp_during_lift) score += 20;
  if (data.pain_type === "Localized") score += 20;
  if (data.pain_scale >= 5 && data.pain_scale <= 7) score += 20;
  if (!data.radiates) score += 10;
  if (data.light_load_possible) score += 10;
  return clamp(score, 0, 100);
}

function catastrophizingIndex(data: InjuryInput, structuralRisk: number): number {
  if (
    structuralRisk < 40 &&
    data.pain_scale <= 6 &&
    !data.swelling &&
    !data.radiates &&
    data.improved_after_warmup
  ) {
    return Math.floor(Math.random() * 21) + 70; // 70–90
  }
  return Math.floor(Math.random() * 21) + 20; // 20–40
}

function riskLevel(structuralRisk: number): "GREEN" | "YELLOW" | "RED" {
  if (structuralRisk >= 70) return "RED";
  if (structuralRisk >= 40) return "YELLOW";
  return "GREEN";
}

function likelyIssue(
  structuralRisk: number,
  domsProb: number,
  strainScore: number,
  catastrophizing: number,
  level: "GREEN" | "YELLOW" | "RED"
): string {
  if (level === "RED") return "Possible structural concern — get it checked.";
  if (level === "YELLOW") {
    if (strainScore >= 50) return "Likely muscle strain. Ease off and reassess.";
    return "Moderate concern. Avoid heavy loading and reassess in 48h.";
  }
  if (catastrophizing >= 70) return "Likely normal soreness. You are probably fine.";
  if (domsProb >= 60)
    return "Delayed onset muscle soreness. This looks like classic post-workout soreness.";
  if (strainScore >= 40) return "Mild strain possible. Light movement and mobility are fine.";
  return "Likely normal soreness. Light activity and mobility are okay.";
}

function recommendations(level: "GREEN" | "YELLOW" | "RED"): string[] {
  if (level === "GREEN")
    return [
      "Train a different muscle group today.",
      "Light cardio is fine.",
      "Include mobility work.",
    ];
  if (level === "YELLOW")
    return [
      "Avoid heavy compound lifts on this area.",
      "No max effort for 48 hours.",
      "Reassess in 48 hours.",
    ];
  return [
    "Stop loading this area.",
    "Consider seeing a physio if it persists.",
    "Avoid aggressive stretching.",
  ];
}

function monitorFor(
  level: "GREEN" | "YELLOW" | "RED",
  data: InjuryInput
): string[] {
  let monitor: string[];
  if (level === "GREEN") monitor = ["Pain getting worse", "New swelling", "Radiating pain"];
  else if (level === "YELLOW")
    monitor = ["Increasing swelling", "Radiating pain", "Loss of strength"];
  else
    monitor = [
      "Increasing swelling",
      "Radiating pain",
      "Loss of strength",
      "Numbness or tingling",
    ];
  if (data.previous_injury) monitor.push("Re-injury or pain in same spot");
  return monitor;
}

function googleSpiralProbability(catastrophizing: number, structuralRisk: number): number {
  if (catastrophizing > 70 && structuralRisk < 40)
    return Math.floor(Math.random() * 11) + 85; // 85–95
  return Math.floor(Math.random() * 21) + 30; // 30–50
}

const VALID_LOCATIONS = [
  "Shoulder", "Elbow", "Wrist", "Upper back", "Lower back",
  "Hip", "Knee", "Ankle", "Neck", "Chest", "Other",
];
const VALID_PAIN_TYPES = ["Dull ache", "Sharp", "Burning", "Localized", "Throbbing", "Other"];
const VALID_ONSET = ["During lift", "Hours after workout", "Next day"];

function validateBody(body: unknown): { ok: true; data: InjuryInput } | { ok: false; error: string } {
  if (!body || typeof body !== "object") return { ok: false, error: "Request body must be JSON." };
  const b = body as Record<string, unknown>;
  const pain_scale = typeof b.pain_scale === "number" ? b.pain_scale : Number(b.pain_scale);
  if (!Number.isInteger(pain_scale) || pain_scale < 1 || pain_scale > 10)
    return { ok: false, error: "pain_scale must be an integer between 1 and 10." };
  const pain_location = typeof b.pain_location === "string" ? b.pain_location : "";
  const pain_type = typeof b.pain_type === "string" ? b.pain_type : "";
  const onset_timing = typeof b.onset_timing === "string" ? b.onset_timing : "";
  if (!VALID_LOCATIONS.includes(pain_location))
    return { ok: false, error: `pain_location must be one of: ${VALID_LOCATIONS.join(", ")}` };
  if (!VALID_PAIN_TYPES.includes(pain_type))
    return { ok: false, error: `pain_type must be one of: ${VALID_PAIN_TYPES.join(", ")}` };
  if (!VALID_ONSET.includes(onset_timing))
    return { ok: false, error: `onset_timing must be one of: ${VALID_ONSET.join(", ")}` };
  const data: InjuryInput = {
    pain_location,
    pain_type,
    pain_scale,
    radiates: Boolean(b.radiates),
    improved_after_warmup: Boolean(b.improved_after_warmup),
    sharp_during_lift: Boolean(b.sharp_during_lift),
    swelling: Boolean(b.swelling),
    previous_injury: Boolean(b.previous_injury),
    onset_timing,
    light_load_possible: Boolean(b.light_load_possible),
  };
  return { ok: true, data };
}

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON." }, { status: 400 });
  }
  const validated = validateBody(body);
  if (!validated.ok) {
    return Response.json({ detail: validated.error }, { status: 400 });
  }
  const data = validated.data;

  let structuralRisk = structuralInjuryRisk(data);
  const domsProb = domsProbability(data);
  const strainScore = muscleStrainScore(data);

  if (data.radiates && data.swelling && data.pain_scale >= 8)
    structuralRisk = Math.max(structuralRisk, 70);
  if (data.pain_scale <= 3) structuralRisk = Math.min(structuralRisk, 39);
  if (data.previous_injury && structuralRisk >= 40)
    structuralRisk = clamp(structuralRisk + 10, 0, 100);

  const catastrophizing = catastrophizingIndex(data, structuralRisk);
  const level = riskLevel(structuralRisk);

  return Response.json({
    risk_level: level,
    structural_risk: Math.round(structuralRisk),
    doms_probability: Math.round(domsProb),
    strain_score: Math.round(strainScore),
    catastrophizing_index: catastrophizing,
    likely_issue: likelyIssue(structuralRisk, domsProb, strainScore, catastrophizing, level),
    recommendations: recommendations(level),
    monitor_for: monitorFor(level, data),
    google_spiral_probability: googleSpiralProbability(catastrophizing, structuralRisk),
  });
}
