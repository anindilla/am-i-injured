import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-page px-4 py-12 sm:px-6 sm:py-16">
      <main className="w-full max-w-md text-center">
        <div className="bg-gradient-card rounded-2xl border border-white/30 px-6 py-8 shadow-2xl backdrop-blur-xl sm:px-8 sm:py-10">
          <h1 className="text-3xl font-bold text-stone-800 sm:text-4xl dark:text-stone-100">
            Am I Injured?
          </h1>
          <p className="mt-3 text-stone-700 dark:text-stone-300">
            Quick check: soreness vs. strain vs. something to get looked at. Not
            a medical diagnosis — just a sanity check.
          </p>
          <Link
            href="/injury-check"
            className="bg-gradient-cta mt-8 inline-block min-h-[48px] rounded-xl px-6 py-3 font-semibold text-white shadow-lg transition hover:opacity-95 active:scale-[0.98]"
          >
            Start Injury Check
          </Link>
        </div>
      </main>
    </div>
  );
}
