import Link from "next/link";

export function NavBar() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/20 bg-white/60 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link href="/" className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-blue-600 flex items-center justify-center">
            <div className="w-2 h-2 bg-white rounded-full" />
          </div>
          TalentLens
        </Link>
        <nav>
          <Link
            href="/login"
            className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors px-4 py-2"
          >
            Sign In
          </Link>
        </nav>
      </div>
    </header>
  );
}