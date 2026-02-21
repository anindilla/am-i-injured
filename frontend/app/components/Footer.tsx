import Link from "next/link";
import { Sparkles } from "lucide-react";

export default function Footer() {
  return (
    <footer className="mt-auto shrink-0 py-2 text-center text-sm text-white">
      <Sparkles className="mr-1 inline h-3.5 w-3.5 opacity-80" strokeWidth={2} aria-hidden />
      Vibe-coded by{" "}
      <Link
        href="https://anindilla.com"
        target="_blank"
        rel="noopener noreferrer"
        className="font-medium underline decoration-white/50 underline-offset-2 hover:decoration-white"
      >
        dilleuh
      </Link>
    </footer>
  );
}
