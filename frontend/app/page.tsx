import Link from "next/link";
import { Activity, ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-page px-4 py-6 sm:px-6 sm:py-8">
      <main className="w-full max-w-md text-center">
        <div className="bg-gradient-card rounded-2xl border border-white/30 px-6 py-8 shadow-2xl backdrop-blur-xl sm:px-8 sm:py-10">
          <div className="flex items-center justify-center gap-2">
            <Activity className="h-8 w-8 text-violet-600 dark:text-violet-400" strokeWidth={2} aria-hidden />
            <h1 className="text-3xl font-bold text-stone-800 sm:text-4xl dark:text-stone-100">
              Am I Injured?
            </h1>
          </div>
          <p className="mt-3 text-stone-700 dark:text-stone-300">
            Quick check: soreness vs. strain vs. something to get looked at. Not
            a medical diagnosis — just a sanity check.
          </p>
          <Link
            href="/injury-check"
            className="bg-gradient-cta mt-8 inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl px-6 py-3 font-semibold text-white shadow-lg transition hover:opacity-95 active:scale-[0.98]"
          >
            Start Injury Check
            <ArrowRight className="h-4 w-4" strokeWidth={2.5} aria-hidden />
          </Link>
        </div>
      </main>
    </div>
  );
}
