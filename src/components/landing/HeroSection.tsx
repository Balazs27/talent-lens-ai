import Link from "next/link";

export function HeroSection() {
  return (
    <section className="relative min-h-[90vh] pt-32 pb-20 lg:pt-48 lg:pb-32 px-6 flex items-center overflow-hidden bg-slate-50">
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-blue-600/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-indigo-500/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto w-full grid lg:grid-cols-2 gap-16 items-center">
        <div className="flex flex-col items-start text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50/80 backdrop-blur-sm border border-blue-200/50 text-blue-600 text-sm font-semibold mb-8 shadow-sm">
            <span className="flex h-2 w-2 rounded-full bg-blue-600 animate-pulse"></span>
            Introducing Hybrid Matching
          </div>
          
          <h1 className="text-6xl sm:text-7xl lg:text-[7.5rem] font-extrabold tracking-tighter text-slate-950 leading-[0.85]">
            Intelligence <br/> for the <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-500 pb-2 inline-block">
              modern workforce.
            </span>
          </h1>
          
          <p className="mt-8 max-w-lg text-lg sm:text-xl text-slate-500 leading-relaxed font-medium">
            Upload a resume. Extract skills automatically. Discover your best job matches instantly with hybrid AI matching.
          </p>
          
          <div className="mt-10 flex items-center gap-4">
            <Link
              href="/signup"
              className="inline-flex h-14 items-center justify-center rounded-full bg-blue-600 px-8 text-base font-semibold text-white transition-all hover:-translate-y-1 hover:bg-blue-500 shadow-[0_0_40px_-10px_rgba(37,99,235,0.4)] ring-1 ring-white/20"
            >
              Get Started
            </Link>
            <a
              href="#demo"
              className="inline-flex h-14 items-center justify-center rounded-full bg-white px-8 text-base font-semibold text-slate-700 transition-all hover:-translate-y-1 hover:bg-slate-50 shadow-sm border border-slate-200"
            >
              Watch Demo
            </a>
          </div>
        </div>

        <div className="relative w-full aspect-square md:aspect-[4/3] lg:aspect-square perspective-[2000px] mt-12 lg:mt-0 hidden md:block">
          <div className="w-full h-full relative transform-gpu rotate-y-[-12deg] rotate-x-[8deg] hover:rotate-y-[-8deg] hover:rotate-x-[4deg] transition-transform duration-700 ease-out">
            <div className="absolute inset-0 bg-blue-500/20 blur-[60px] rounded-full" />
            <div className="absolute inset-4 sm:inset-8 bg-white/40 backdrop-blur-2xl rounded-[2rem] border border-white/60 shadow-[0_24px_48px_-12px_rgba(0,0,0,0.1)] p-6 flex flex-col gap-6 overflow-hidden">
              <div className="flex items-center justify-between pb-4 border-b border-white/40">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/20">
                    <span className="text-white font-bold text-sm">JD</span>
                  </div>
                  <div>
                    <div className="h-4 w-32 bg-slate-800/80 rounded-md mb-2" />
                    <div className="h-3 w-20 bg-slate-500/60 rounded-md" />
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-blue-600 to-indigo-600 tracking-tighter">94%</div>
                  <div className="text-[10px] uppercase tracking-widest font-bold text-slate-400 mt-1">Match Score</div>
                </div>
              </div>

              <div className="flex-1 flex flex-col gap-4 mt-2">
                <div className="h-3 w-24 bg-slate-400/50 rounded-md mb-2" />
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3.5 rounded-xl bg-white/60 border border-white/60 shadow-sm">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    <div className="flex-1 h-3 bg-slate-700/80 rounded-md" />
                    <div className="w-14 h-5 bg-emerald-100/80 rounded-md border border-emerald-200" />
                  </div>
                  <div className="flex items-center gap-3 p-3.5 rounded-xl bg-white/60 border border-white/60 shadow-sm">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    <div className="flex-1 h-3 bg-slate-700/80 rounded-md mr-12" />
                    <div className="w-14 h-5 bg-emerald-100/80 rounded-md border border-emerald-200" />
                  </div>
                  <div className="flex items-center gap-3 p-3.5 rounded-xl bg-white/30 border border-white/40 border-dashed">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                    <div className="flex-1 h-3 bg-slate-400/60 rounded-md mr-16" />
                    <div className="text-[10px] font-bold text-red-500 uppercase tracking-wider">Missing</div>
                  </div>
                </div>
              </div>

              <div className="mt-auto h-12 w-full rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50/50 border border-blue-100/50 flex items-center justify-center text-xs font-bold text-blue-600 uppercase tracking-wide">
                Analyze Skill Gap
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
