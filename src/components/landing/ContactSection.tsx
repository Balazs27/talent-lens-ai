import Link from "next/link";

export function ContactSection() {
  return (
    <footer className="py-12 px-6 border-t border-slate-200/60 bg-slate-50 text-center flex flex-col items-center">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-5 h-5 rounded-md bg-blue-600 flex items-center justify-center shadow-sm shadow-blue-600/30">
          <div className="w-1.5 h-1.5 bg-white rounded-full" />
        </div>
        <span className="font-bold text-slate-800">TalentLens</span>
      </div>
      <p className="text-sm text-slate-400 mb-6">
        © {new Date().getFullYear()} TalentLens AI. All rights reserved.
      </p>
      <div className="flex gap-6">
        <Link href="#" className="text-slate-400 hover:text-slate-700 transition-colors text-sm font-medium">Twitter</Link>
        <Link href="#" className="text-slate-400 hover:text-slate-700 transition-colors text-sm font-medium">LinkedIn</Link>
        <Link href="mailto:hello@talentlens.ai" className="text-slate-400 hover:text-slate-700 transition-colors text-sm font-medium">Contact</Link>
      </div>
    </footer>
  );
}
