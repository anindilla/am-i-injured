"use client";

import { useState } from "react";
import type { InjuryInput, AnalyzeResponse } from "@/lib/types";
import {
  PAIN_LOCATIONS,
  PAIN_TYPES,
  ONSET_TIMING,
} from "@/lib/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const initialForm: InjuryInput = {
  pain_location: "",
  pain_type: "",
  pain_scale: 5,
  radiates: false,
  improved_after_warmup: false,
  sharp_during_lift: false,
  swelling: false,
  previous_injury: false,
  onset_timing: "",
  light_load_possible: true,
};

export default function InjuryCheckPage() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<InjuryInput>(initialForm);
  const [result, setResult] = useState<AnalyzeResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const update = (patch: Partial<InjuryInput>) => {
    setForm((prev) => ({ ...prev, ...patch }));
    setError(null);
  };

  const canProceedStep1 =
    form.pain_location && form.pain_type && form.pain_scale >= 1 && form.pain_scale <= 10;
  const canProceedStep3 = !!form.onset_timing;

  const submit = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/api/analyze/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        let message = `Request failed: ${res.status}`;
        if (typeof err === "object" && err !== null) {
          if (typeof err.detail === "string") message = err.detail;
          else if (Array.isArray(err.detail)) message = err.detail.join(" ");
          else if (typeof err.detail === "object" && err.detail !== null)
            message = Object.values(err.detail).flat().join(" ");
          else if (Object.keys(err).length > 0) {
            const firstMessages = Object.values(err).flat().filter(Boolean);
            if (firstMessages.length) message = firstMessages.slice(0, 3).join(" ");
          }
        }
        throw new Error(message);
      }
      const data: AnalyzeResponse = await res.json();
      setResult(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setStep(1);
    setForm(initialForm);
    setResult(null);
    setError(null);
  };

  if (result) {
    return (
      <div className="min-h-screen bg-gradient-page px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <div className="mx-auto max-w-2xl">
          <ResultsCard data={result} onReset={reset} />
          <Disclaimer />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-page px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <div className="bg-gradient-card mx-auto max-w-xl rounded-2xl border border-white/30 p-6 shadow-2xl backdrop-blur-xl sm:p-8">
        <h1 className="text-2xl font-semibold text-stone-800 dark:text-stone-100 sm:text-3xl">
          Am I Injured?
        </h1>
        <p className="mt-1 text-sm text-stone-600 dark:text-stone-300 sm:text-base">
          Quick check: soreness vs. strain vs. something to get looked at.
        </p>

        <div className="mt-6 flex gap-2">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`h-2 flex-1 rounded-full ${
                s <= step ? "bg-gradient-cta" : "bg-stone-300 dark:bg-stone-600 opacity-70"
              }`}
            />
          ))}
        </div>

        {step === 1 && (
          <div className="mt-8 space-y-6">
            <label className="block">
              <span className="text-sm font-medium text-stone-700 dark:text-stone-200 sm:text-base">
                Pain Location
              </span>
              <select
                value={form.pain_location}
                onChange={(e) => update({ pain_location: e.target.value })}
                className="mt-1 w-full rounded-xl border border-stone-300 bg-white/95 px-3 py-2.5 text-stone-800 dark:border-stone-600 dark:bg-stone-800/95 dark:text-stone-100"
              >
                <option value="">Select…</option>
                {PAIN_LOCATIONS.map((loc) => (
                  <option key={loc} value={loc}>
                    {loc}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="text-sm font-medium text-stone-700 dark:text-stone-200 sm:text-base">
                Pain Type
              </span>
              <select
                value={form.pain_type}
                onChange={(e) => update({ pain_type: e.target.value })}
                className="mt-1 w-full rounded-xl border border-stone-300 bg-white/95 px-3 py-2.5 text-stone-800 dark:border-stone-600 dark:bg-stone-800/95 dark:text-stone-100"
              >
                <option value="">Select…</option>
                {PAIN_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </label>
            <div>
              <span className="text-sm font-medium text-stone-700 dark:text-stone-200 sm:text-base">
                Pain Scale (1–10)
              </span>
              <div className="mt-2 flex items-center gap-4">
                <input
                  type="range"
                  min={1}
                  max={10}
                  value={form.pain_scale}
                  onChange={(e) =>
                    update({ pain_scale: parseInt(e.target.value, 10) })
                  }
                  className="h-3 w-full flex-1 accent-violet-600"
                />
                <span className="w-8 text-right text-lg font-medium text-stone-700 dark:text-stone-200">
                  {form.pain_scale}
                </span>
              </div>
            </div>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setStep(2)}
                disabled={!canProceedStep1}
                className="bg-gradient-cta min-h-[44px] rounded-xl px-5 py-2.5 font-semibold text-white shadow-md disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="mt-8 space-y-6">
            <p className="text-sm text-stone-600 dark:text-stone-300 sm:text-base">
              A few yes/no questions:
            </p>
            {[
              { key: "radiates", label: "Did the pain radiate?" },
              { key: "improved_after_warmup", label: "Did it improve after warmup?" },
              { key: "sharp_during_lift", label: "Sudden sharp pain during the lift?" },
              { key: "swelling", label: "Swelling or bruising?" },
              { key: "previous_injury", label: "Previous injury in same area?" },
              {
                key: "light_load_possible",
                label: "Can you load it lightly without sharp pain?",
              },
            ].map(({ key, label }) => (
              <div
                key={key}
                className="flex flex-col gap-2 rounded-xl border border-stone-200 bg-stone-50/80 px-4 py-3 dark:border-stone-600 dark:bg-stone-800/50 sm:flex-row sm:items-center sm:justify-between"
              >
                <span className="text-stone-800 dark:text-stone-200">{label}</span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      update({ [key]: true } as Partial<InjuryInput>)
                    }
                    className={`min-h-[44px] min-w-[72px] rounded-lg px-4 py-2.5 text-sm font-medium ${
                      form[key as keyof InjuryInput] === true
                        ? "bg-gradient-cta text-white shadow"
                        : "bg-stone-200 text-stone-700 dark:bg-stone-600 dark:text-stone-200"
                    }`}
                  >
                    Yes
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      update({ [key]: false } as Partial<InjuryInput>)
                    }
                    className={`min-h-[44px] min-w-[72px] rounded-lg px-4 py-2.5 text-sm font-medium ${
                      form[key as keyof InjuryInput] === false
                        ? "bg-stone-700 text-white dark:bg-stone-500 dark:text-white"
                        : "bg-stone-200 text-stone-700 dark:bg-stone-600 dark:text-stone-200"
                    }`}
                  >
                    No
                  </button>
                </div>
              </div>
            ))}
            <div className="flex justify-between gap-4 pt-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="min-h-[44px] rounded-xl border-2 border-stone-400 bg-white/80 px-5 py-2.5 font-medium text-stone-800 dark:border-stone-500 dark:bg-stone-800/80 dark:text-stone-200"
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => setStep(3)}
                className="bg-gradient-cta min-h-[44px] rounded-xl px-5 py-2.5 font-semibold text-white shadow-md"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="mt-8 space-y-6">
            <label className="block">
              <span className="text-sm font-medium text-stone-700 dark:text-stone-200 sm:text-base">
                When did it start?
              </span>
              <select
                value={form.onset_timing}
                onChange={(e) => update({ onset_timing: e.target.value })}
                className="mt-1 w-full rounded-xl border border-stone-300 bg-white/95 px-3 py-2.5 text-stone-800 dark:border-stone-600 dark:bg-stone-800/95 dark:text-stone-100"
              >
                <option value="">Select…</option>
                {ONSET_TIMING.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </label>
            {error && (
              <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-300">
                {error}
              </p>
            )}
            <div className="flex justify-between gap-4 pt-2">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="min-h-[44px] rounded-xl border-2 border-stone-400 bg-white/80 px-5 py-2.5 font-medium text-stone-800 dark:border-stone-500 dark:bg-stone-800/80 dark:text-stone-200"
              >
                Back
              </button>
              <button
                type="button"
                onClick={submit}
                disabled={!canProceedStep3 || loading}
                className="bg-gradient-cta min-h-[44px] rounded-xl px-5 py-2.5 font-semibold text-white shadow-md disabled:opacity-50"
              >
                {loading ? "Checking…" : "See Result"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ResultsCard({
  data,
  onReset,
}: {
  data: AnalyzeResponse;
  onReset: () => void;
}) {
  const riskColors = {
    GREEN: "bg-emerald-500 text-white",
    YELLOW: "bg-amber-500 text-white",
    RED: "bg-red-600 text-white",
  };
  const riskBorder = {
    GREEN: "border-emerald-300 dark:border-emerald-500",
    YELLOW: "border-amber-300 dark:border-amber-500",
    RED: "border-red-400 dark:border-red-500",
  };

  return (
    <div
      className={`bg-gradient-card rounded-2xl border-2 p-6 shadow-xl backdrop-blur-xl sm:p-8 ${riskBorder[data.risk_level]}`}
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-xl font-semibold text-stone-800 dark:text-stone-100">
          Your Result
        </h2>
        <button
          type="button"
          onClick={onReset}
          className="min-h-[44px] min-w-[44px] self-start text-sm font-medium text-violet-700 underline dark:text-violet-300 sm:self-center"
        >
          Start Over
        </button>
      </div>
      <div className="mt-4">
        <span
          className={`inline-block rounded-full px-4 py-1.5 text-sm font-semibold ${riskColors[data.risk_level]}`}
        >
          {data.risk_level}
        </span>
      </div>

      <p className="mt-4 text-lg text-stone-800 dark:text-stone-200">
        {data.likely_issue}
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <ScoreBar label="Structural Risk" value={data.structural_risk} />
        <ScoreBar label="DOMS Likelihood" value={data.doms_probability} />
        <ScoreBar label="Strain Score" value={data.strain_score} />
        <ScoreBar
          label="Catastrophizing Index"
          value={data.catastrophizing_index}
        />
      </div>

      <div className="mt-6">
        <h3 className="text-sm font-semibold text-stone-700 dark:text-stone-200">
          What to Do Today
        </h3>
        <ul className="mt-2 list-inside list-disc space-y-1 text-stone-700 dark:text-stone-300">
          {data.recommendations.map((r, i) => (
            <li key={i}>{r}</li>
          ))}
        </ul>
      </div>

      <div className="mt-4">
        <h3 className="text-sm font-semibold text-stone-700 dark:text-stone-200">
          What Not to Do
        </h3>
        <ul className="mt-2 list-inside list-disc space-y-1 text-stone-600 dark:text-stone-400">
          {data.risk_level === "GREEN" && (
            <>
              <li>Don’t max out the sore area today.</li>
              <li>Don’t assume the worst.</li>
            </>
          )}
          {data.risk_level === "YELLOW" && (
            <>
              <li>Don’t do heavy compound lifts on this area.</li>
              <li>Don’t push through sharp pain.</li>
            </>
          )}
          {data.risk_level === "RED" && (
            <>
              <li>Don’t load this area until reassessed.</li>
              <li>Don’t stretch aggressively.</li>
            </>
          )}
        </ul>
      </div>

      <div className="mt-4">
        <h3 className="text-sm font-semibold text-stone-700 dark:text-stone-200">
          48-Hour Monitoring
        </h3>
        <ul className="mt-2 list-inside list-disc space-y-1 text-stone-600 dark:text-stone-400">
          {data.monitor_for.map((m, i) => (
            <li key={i}>{m}</li>
          ))}
        </ul>
      </div>

      {data.google_spiral_probability > 70 && (
        <p className="mt-6 rounded-xl bg-amber-100/90 px-4 py-3 text-sm text-amber-900 dark:bg-amber-900/40 dark:text-amber-100">
          You are {data.google_spiral_probability}% likely to Google
          &ldquo;herniated disc symptoms&rdquo; tonight. (We&apos;re only half
          joking.)
        </p>
      )}
    </div>
  );
}

function ScoreBar({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="flex justify-between text-sm">
        <span className="text-stone-600 dark:text-stone-400">{label}</span>
        <span className="font-medium text-stone-800 dark:text-stone-200">
          {value}
        </span>
      </div>
      <div className="mt-1 h-2.5 w-full overflow-hidden rounded-full bg-stone-200 dark:bg-stone-600">
        <div
          className="bg-gradient-cta h-full rounded-full"
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

function Disclaimer() {
  return (
    <p className="mt-8 pb-8 text-center text-sm text-stone-500 dark:text-stone-400">
      This tool does not replace medical advice. If symptoms worsen, seek
      professional care.
    </p>
  );
}
