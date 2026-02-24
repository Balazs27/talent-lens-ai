import Link from "next/link";

export function HeroSection() {
  return (
    <section className="relative pt-32 pb-32 md:pt-48 md:pb-56 px-6 flex flex-col items-center text-center overflow-hidden">
      {/* Subtle radial royal-blue glow behind headline */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[500px] md:w-[800px] md:h-[600px] bg-blue-600/10 blur-[100px] rounded-full pointer-events-none" />

      <div className="relative z-10 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50/80 backdrop-blur-sm border border-blue-200/50 text-blue-600 text-sm font-medium mb-8 shadow-sm">
        <span className="flex h-2 w-2 rounded-full bg-blue-600 animate-pulse"></span>
        Introducing Hybrid Matching
      </div>
      
      <h1 className="relative z-10 max-w-5xl text-6xl md:text-8xl lg:text-[8.5rem] font-extrabold tracking-tighter text-slate-950 leading-[0.95]">
        Intelligence for the <br className="hidden md:block" />
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-500">
          modern workforce.
        </span>
      </h1>
      
      <p className="relative z-10 mt-8 max-w-xl text-lg md:text-xl text-slate-600 leading-relaxed font-medium">
        Upload resumes. Extract skills. Uncover the perfect internal matches instantly with our hybrid semantic search engine.
      </p>
      
      <div className="relative z-10 mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
        <Link
          href="/signup"
          className="inline-flex h-12 items-center justify-center rounded-full bg-blue-600 px-8 text-base font-medium text-white transition-all hover:-translate-y-0.5 hover:bg-blue-700 shadow-[0_0_40px_-10px_rgba(37,99,235,0.3)] hover:shadow-[0_0_60px_-15px_rgba(37,99,235,0.5)] ring-1 ring-white/20 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2"
        >
          Get Started
        </Link>
      </div>
    </section>
  );
}