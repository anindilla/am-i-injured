import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-auto shrink-0 py-2 text-center text-sm text-white">
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
