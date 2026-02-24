import Link from "next/link"

export default function HomePage() {
  return (
    <main className="min-h-screen relative overflow-hidden">
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-indigo-50" />
      <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full bg-blue-100/40 blur-3xl -translate-y-1/2 translate-x-1/4" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-indigo-100/40 blur-3xl translate-y-1/2 -translate-x-1/4" />

      {/* Content */}
      <div className="relative flex flex-col items-center justify-center min-h-screen px-4">
        {/* Glass hero card */}
        <div className="w-full max-w-lg rounded-2xl border border-white/30 bg-white/60 backdrop-blur-xl shadow-lg p-10 text-center">
          <h1 className="text-3xl font-semibold tracking-tight text-gray-900">
            TalentLens AI
          </h1>
          <p className="mt-3 text-base text-gray-500 max-w-sm mx-auto leading-relaxed">
            AI-powered talent matching that works for both sides of the hiring
            table.
          </p>

          <div className="mt-8 flex gap-3 justify-center">
            <Link
              href="/login"
              className="rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
            >
              Sign in
            </Link>
            <Link
              href="/signup"
              className="rounded-lg border border-gray-200 bg-white px-6 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Create account
            </Link>
          </div>
        </div>

        {/* Feature highlights */}
        <div className="mt-12 grid gap-6 sm:grid-cols-3 max-w-2xl w-full">
          <div className="text-center">
            <div className="mx-auto w-10 h-10 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 text-lg font-semibold">
              1
            </div>
            <p className="mt-2 text-sm font-medium text-gray-800">
              Upload & Extract
            </p>
            <p className="mt-1 text-xs text-gray-500">
              Paste a resume or job description. AI extracts skills instantly.
            </p>
          </div>
          <div className="text-center">
            <div className="mx-auto w-10 h-10 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 text-lg font-semibold">
              2
            </div>
            <p className="mt-2 text-sm font-medium text-gray-800">
              Match & Rank
            </p>
            <p className="mt-1 text-xs text-gray-500">
              Deterministic skill matching ranks candidates and jobs by fit.
            </p>
          </div>
          <div className="text-center">
            <div className="mx-auto w-10 h-10 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 text-lg font-semibold">
              3
            </div>
            <p className="mt-2 text-sm font-medium text-gray-800">
              Analyze Gaps
            </p>
            <p className="mt-1 text-xs text-gray-500">
              AI-powered gap analysis with actionable learning recommendations.
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}
