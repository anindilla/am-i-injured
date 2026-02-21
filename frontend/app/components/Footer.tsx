import Link from "next/link";

export default function Footer() {
  return (
    <footer className="py-4 text-center text-sm text-stone-500 dark:text-stone-400">
      Vibe-coded by{" "}
      <Link
        href="https://anindilla.com"
        target="_blank"
        rel="noopener noreferrer"
        className="font-medium text-stone-700 underline decoration-stone-400 underline-offset-2 hover:text-violet-600 hover:decoration-violet-500 dark:text-stone-300 dark:decoration-stone-500 dark:hover:text-violet-400 dark:hover:decoration-violet-400"
      >
        dilleuh
      </Link>
    </footer>
  );
}
