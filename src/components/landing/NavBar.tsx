"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion, useScroll } from "framer-motion";

export function NavBar() {
  const [scrolled, setScrolled] = useState(false);
  const { scrollY } = useScroll();

  useEffect(() => {
    const unsub = scrollY.on("change", (v) => setScrolled(v > 10));
    return unsub;
  }, [scrollY]);

  return (
    <motion.header
      className="fixed top-0 left-0 right-0 z-50 border-b"
      animate={{
        borderColor: scrolled ? "rgba(226,232,240,0.5)" : "rgba(255,255,255,0.1)",
        backgroundColor: scrolled ? "rgba(255,255,255,0.85)" : "rgba(255,255,255,0.2)",
        boxShadow: scrolled
          ? "0 1px 20px -5px rgba(0,0,0,0.08)"
          : "0 0 0 0 rgba(0,0,0,0)",
      }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      style={{ backdropFilter: scrolled ? "blur(20px)" : "blur(8px)" }}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link href="/" className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-blue-600 flex items-center justify-center shadow-sm shadow-blue-600/30">
            <div className="w-2 h-2 bg-white rounded-full" />
          </div>
          TalentLens
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {["Features", "How it Works", "Pricing", "Support"].map((item) => (
            <a
              key={item}
              href="#"
              className="text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors px-4 py-2 rounded-lg hover:bg-slate-100/60"
            >
              {item}
            </a>
          ))}
        </nav>

        <Link
          href="/login"
          className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors px-4 py-2"
        >
          Sign In
        </Link>
      </div>
    </motion.header>
  );
}
