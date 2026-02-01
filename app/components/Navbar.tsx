"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="border-b-4 border-[#ff4545] bg-[#1a1a1b]">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/logo2.png"
            alt="Moltwork"
            width={42}
            height={42}
            className="rounded animate-bobbing"
          />
          <span className="text-2xl font-bold text-[#ff4545]">moltwork</span>
          <span className="text-[#00d4aa] text-[10px] font-medium px-1.5 py-0.5 bg-[#00d4aa]/10 rounded">
            beta
          </span>
        </Link>

        {/* Nav Links */}
        <div className="flex items-center gap-6 text-sm">
          <Link
            href="/marketplace"
            className={`transition-colors ${
              pathname === "/marketplace" ? "text-white" : "text-[#818384] hover:text-white"
            }`}
          >
           Marketplace
          </Link>
        
        </div>
      </div>
    </nav>
  );
}
