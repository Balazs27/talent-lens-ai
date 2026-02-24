export function ProductPreviewSection() {
  return (
    <section className="relative py-24 px-6 flex justify-center w-full bg-gradient-to-b from-transparent via-blue-50/30 to-transparent overflow-hidden">
      {/* Subtle top divider */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-px bg-gradient-to-r from-transparent via-blue-200/50 to-transparent" />

      <div className="w-full max-w-6xl relative z-10">
        {/* 3D Tilt Container */}
        <div className="relative mx-auto w-full [transform:perspective(2000px)_rotateX(4deg)_rotateY(-2deg)] hover:[transform:perspective(2000px)_rotateX(2deg)_rotateY(-1deg)] transition-transform duration-700 ease-out">
          
          {/* Glow border wrapper */}
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-blue-500/30 via-white/10 to-transparent -m-px shadow-[0_0_60px_-15px_rgba(37,99,235,0.2)]" />

          <div className="relative aspect-auto md:aspect-[16/9] w-full rounded-2xl overflow-hidden bg-slate-900/40 backdrop-blur-2xl border border-white/20 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.15),_0_0_40px_rgba(37,99,235,0.1)] flex flex-col items-center justify-center p-4 md:p-8 min-h-[400px]">
            {/* Abstract Representation of UI */}
            <div className="absolute top-0 left-0 w-full h-12 bg-white/10 border-b border-white/10 flex items-center px-4 gap-2 backdrop-blur-md">
              <div className="w-3 h-3 rounded-full bg-white/20"></div>
              <div className="w-3 h-3 rounded-full bg-white/20"></div>
              <div className="w-3 h-3 rounded-full bg-white/20"></div>
            </div>
            
            <div className="w-full max-w-4xl grid md:grid-cols-3 gap-6 mt-12 md:mt-8 relative z-10">
              {/* Left Panel */}
              <div className="hidden md:flex flex-col gap-4">
                <div className="h-32 rounded-xl bg-white/70 backdrop-blur-lg border border-white/40 shadow-sm p-4 flex flex-col gap-3 justify-center">
                  <div className="h-4 w-2/3 bg-slate-200 rounded"></div>
                  <div className="h-3 w-1/2 bg-slate-200/50 rounded"></div>
                </div>
                <div className="h-48 rounded-xl bg-white/70 backdrop-blur-lg border border-white/40 shadow-sm p-4 flex flex-col gap-3">
                  <div className="h-4 w-1/3 bg-slate-200 rounded mb-2"></div>
                  <div className="h-8 w-full bg-white rounded-lg border border-slate-100"></div>
                  <div className="h-8 w-full bg-white rounded-lg border border-slate-100"></div>
                  <div className="h-8 w-full bg-white rounded-lg border border-slate-100"></div>
                </div>
              </div>
              {/* Main Panel */}
              <div className="md:col-span-2 flex flex-col gap-4">
                <div className="h-auto md:h-20 py-4 md:py-0 rounded-xl bg-white/90 backdrop-blur-lg border border-white/40 shadow-lg flex flex-col md:flex-row items-start md:items-center px-6 gap-4">
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex-shrink-0 flex items-center justify-center text-blue-600 font-bold">JD</div>
                  <div className="flex-col gap-2 w-full flex mt-2 md:mt-0">
                    <div className="h-4 w-1/2 md:w-1/3 bg-slate-300 rounded"></div>
                    <div className="h-3 w-3/4 md:w-1/4 bg-slate-200 rounded"></div>
                  </div>
                  <div className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 mt-2 md:mt-0">94%</div>
                </div>
                <div className="h-auto rounded-xl bg-white/90 backdrop-blur-lg border border-white/40 shadow-lg p-6 flex flex-col gap-4">
                  <div className="h-4 w-1/4 bg-slate-300 rounded mb-4"></div>
                  <div className="flex flex-wrap gap-2">
                    <div className="h-8 w-24 bg-blue-50 border border-blue-100/50 rounded-full"></div>
                    <div className="h-8 w-32 bg-blue-50 border border-blue-100/50 rounded-full"></div>
                    <div className="h-8 w-20 bg-blue-50 border border-blue-100/50 rounded-full"></div>
                    <div className="h-8 w-28 bg-slate-50 border border-slate-200/50 rounded-full"></div>
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
      </div>
    </section>
  );
}