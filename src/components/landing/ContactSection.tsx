import Link from "next/link";

export function ContactSection() {
  return (
    <footer className="py-12 px-6 border-t border-slate-200/50 text-center flex flex-col items-center bg-white/40">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-5 h-5 rounded-md bg-blue-600 flex items-center justify-center">
          <div className="w-1.5 h-1.5 bg-white rounded-full" />
        </div>
        <span className="font-bold text-slate-900">TalentLens</span>
      </div>
      <p className="text-sm text-slate-500 mb-6">
        © {new Date().getFullYear()} TalentLens AI. All rights reserved.
      </p>
      <div className="flex gap-6">
        <Link href="#" className="text-slate-400 hover:text-slate-900 transition-colors text-sm font-medium">Twitter</Link>
        <Link href="#" className="text-slate-400 hover:text-slate-900 transition-colors text-sm font-medium">LinkedIn</Link>
        <Link href="mailto:hello@talentlens.ai" className="text-slate-400 hover:text-slate-900 transition-colors text-sm font-medium">Contact</Link>
      </div>
    </footer>
  );
}