export function ProblemSection() {
  return (
    <section className="relative py-32 px-6 bg-slate-950 overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-50" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-blue-600/15 blur-[120px] rounded-full pointer-events-none" />
      
      <div className="relative z-10 mx-auto max-w-4xl text-center">
        <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-white mb-8 leading-[1.1]">
          The black box of hiring <br/> is broken.
        </h2>
        <p className="text-xl md:text-2xl text-slate-400 max-w-3xl mx-auto leading-relaxed font-light">
          Traditional platforms rely on rigid keyword searches, leaving incredible internal talent undiscovered and forcing recruiters to guess. TalentLens translates human experience into structured data, making matching transparent, accurate, and undeniable.
        </p>
      </div>
    </section>
  );
}
