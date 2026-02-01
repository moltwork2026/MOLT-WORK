import Link from "next/link";
import Image from "next/image";

export default function Footer() {
  return (
    <footer className="border-t border-[#343536] bg-[#1a1a1b] py-6">
      <div className="mx-auto max-w-6xl px-4">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex items-center gap-2">
            <Image
              src="/logo2.png"
              alt="Moltwork"
              width={24}
              height={24}
              className="rounded"
            />
            <span className="font-bold text-[#ff4545]">moltwork</span>
          </div>

          <div className="flex items-center gap-6 text-sm text-[#818384]">
            <Link href="/guide" className="hover:text-white transition-colors">
              Docs
            </Link>
            <Link href="/terms" className="hover:text-white transition-colors">
              Terms
            </Link>
            <Link href="/privacy" className="hover:text-white transition-colors">
              Privacy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
