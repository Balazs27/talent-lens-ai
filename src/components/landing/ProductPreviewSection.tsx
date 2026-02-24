export function ProductPreviewSection() {
  return (
    <section className="py-24 px-6 flex justify-center w-full">
      <div className="w-full max-w-6xl">
        <div className="relative aspect-auto md:aspect-[16/9] w-full rounded-2xl overflow-hidden bg-slate-900/5 backdrop-blur-xl border border-white/60 shadow-[0_20px_40px_-15px_rgba(37,99,235,0.15)] flex flex-col items-center justify-center p-4 md:p-8 min-h-[400px]">
          {/* Abstract Representation of UI */}
          <div className="absolute top-0 left-0 w-full h-12 bg-white/40 border-b border-white/50 flex items-center px-4 gap-2">
            <div className="w-3 h-3 rounded-full bg-slate-300"></div>
            <div className="w-3 h-3 rounded-full bg-slate-300"></div>
            <div className="w-3 h-3 rounded-full bg-slate-300"></div>
          </div>
          
          <div className="w-full max-w-4xl grid md:grid-cols-3 gap-6 mt-12 md:mt-8">
            {/* Left Panel */}
            <div className="hidden md:flex flex-col gap-4">
              <div className="h-32 rounded-xl bg-white/60 border border-white/50 shadow-sm p-4 flex flex-col gap-3 justify-center">
                <div className="h-4 w-2/3 bg-slate-200 rounded"></div>
                <div className="h-3 w-1/2 bg-slate-200/50 rounded"></div>
              </div>
              <div className="h-48 rounded-xl bg-white/60 border border-white/50 shadow-sm p-4 flex flex-col gap-3">
                <div className="h-4 w-1/3 bg-slate-200 rounded mb-2"></div>
                <div className="h-8 w-full bg-white rounded-lg border border-slate-100"></div>
                <div className="h-8 w-full bg-white rounded-lg border border-slate-100"></div>
                <div className="h-8 w-full bg-white rounded-lg border border-slate-100"></div>
              </div>
            </div>
            {/* Main Panel */}
            <div className="md:col-span-2 flex flex-col gap-4">
              <div className="h-auto md:h-20 py-4 md:py-0 rounded-xl bg-white/80 border border-white/50 shadow-sm flex flex-col md:flex-row items-start md:items-center px-6 gap-4">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex-shrink-0 flex items-center justify-center text-blue-600 font-bold">JD</div>
                <div className="flex-col gap-2 w-full flex mt-2 md:mt-0">
                  <div className="h-4 w-1/2 md:w-1/3 bg-slate-300 rounded"></div>
                  <div className="h-3 w-3/4 md:w-1/4 bg-slate-200 rounded"></div>
                </div>
                <div className="text-2xl font-bold text-blue-600 mt-2 md:mt-0">94%</div>
              </div>
              <div className="h-auto rounded-xl bg-white/80 border border-white/50 shadow-sm p-6 flex flex-col gap-4">
                <div className="h-4 w-1/4 bg-slate-300 rounded mb-4"></div>
                <div className="flex flex-wrap gap-2">
                  <div className="h-8 w-24 bg-blue-50/80 border border-blue-100 rounded-full"></div>
                  <div className="h-8 w-32 bg-blue-50/80 border border-blue-100 rounded-full"></div>
                  <div className="h-8 w-20 bg-blue-50/80 border border-blue-100 rounded-full"></div>
                  <div className="h-8 w-28 bg-slate-50 border border-slate-200 rounded-full"></div>
                </div>
                <div className="h-px w-full bg-slate-100 my-4"></div>
                <div className="flex flex-col gap-3">
                  <div className="h-3 w-full bg-slate-200 rounded"></div>
                  <div className="h-3 w-4/5 bg-slate-200 rounded"></div>
                  <div className="h-3 w-5/6 bg-slate-200 rounded"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}