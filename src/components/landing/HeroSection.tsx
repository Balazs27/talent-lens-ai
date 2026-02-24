import Link from "next/link";

export function HeroSection() {
  return (
    <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 px-6 flex flex-col items-center text-center">
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100/50 text-blue-600 text-sm font-medium mb-8 shadow-sm">
        <span className="flex h-2 w-2 rounded-full bg-blue-600 animate-pulse"></span>
        Introducing Hybrid Matching
      </div>
      <h1 className="max-w-5xl text-5xl md:text-7xl lg:text-8xl font-bold tracking-tighter text-slate-900 leading-[1.1]">
        Intelligence for the <br className="hidden md:block" />
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
          modern workforce.
        </span>
      </h1>
      <p className="mt-6 max-w-2xl text-lg md:text-2xl text-slate-600 leading-relaxed">
        Upload resumes. Extract skills. Uncover the perfect internal matches instantly with our hybrid semantic search engine.
      </p>
      <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
        <Link
          href="/signup"
          className="inline-flex h-12 items-center justify-center rounded-full bg-blue-600 px-8 text-base font-medium text-white transition-all hover:scale-105 hover:bg-blue-700 hover:shadow-[0_0_24px_rgba(37,99,235,0.4)] focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2"
        >
          Get Started
        </Link>
      </div>
    </section>
  );
}