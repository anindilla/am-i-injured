/** Form input — matches backend InjuryInputSerializer */
export interface InjuryInput {
  pain_location: string;
  pain_type: string;
  pain_scale: number;
  radiates: boolean;
  improved_after_warmup: boolean;
  sharp_during_lift: boolean;
  swelling: boolean;
  previous_injury: boolean;
  onset_timing: string;
  light_load_possible: boolean;
}

export type RiskLevel = "GREEN" | "YELLOW" | "RED";

/** API response from POST /api/analyze/ */
export interface AnalyzeResponse {
  risk_level: RiskLevel;
  structural_risk: number;
  doms_probability: number;
  strain_score: number;
  catastrophizing_index: number;
  likely_issue: string;
  recommendations: string[];
  monitor_for: string[];
  google_spiral_probability: number;
}

/** Dropdown options — keep in sync with backend constants */
export const PAIN_LOCATIONS = [
  "Shoulder",
  "Elbow",
  "Wrist",
  "Upper back",
  "Lower back",
  "Hip",
  "Knee",
  "Ankle",
  "Neck",
  "Chest",
  "Other",
] as const;

export const PAIN_TYPES = [
  "Dull ache",
  "Sharp",
  "Burning",
  "Localized",
  "Throbbing",
  "Other",
] as const;

export const ONSET_TIMING = [
  "During lift",
  "Hours after workout",
  "Next day",
] as const;
