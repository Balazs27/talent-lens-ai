import Link from "next/link";

export function CtaSection() {
  return (
    <section className="relative py-32 px-6 bg-slate-950 overflow-hidden">
      <div className="absolute inset-0 bg-blue-900/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="relative z-10 max-w-4xl mx-auto text-center">
        <h2 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white mb-8 leading-[1.1]">
          Ready to discover <br className="hidden md:block"/> your hidden talent?
        </h2>
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/signup"
            className="inline-flex h-14 items-center justify-center rounded-full bg-white px-8 text-base font-bold text-slate-950 transition-all hover:-translate-y-1 hover:bg-slate-100 shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)]"
          >
            Get Started
          </Link>
          <Link
            href="/login"
            className="inline-flex h-14 items-center justify-center rounded-full bg-slate-800/50 backdrop-blur-md border border-slate-700 px-8 text-base font-semibold text-white transition-all hover:-translate-y-1 hover:bg-slate-800"
          >
            Sign In
          </Link>
        </div>
      </div>
    </section>
  );
}
