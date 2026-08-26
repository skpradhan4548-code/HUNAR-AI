import type { Metadata } from "next";
import Link from "next/link";
import { Phone, BarChart2, Users, Plus, Home } from "lucide-react";

export const metadata: Metadata = {
  title: "AI Hiring Assistant | Hunar.AI Platform",
  description: "Conduct AI-powered voice interviews and track hiring pipeline",
};

export default function HiringLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-white border-r border-slate-200 z-40 flex flex-col shadow-sm">
        {/* Logo */}
        <div className="p-5 border-b border-slate-100">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
              <Phone className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="font-bold text-slate-900 text-sm">Hiring Assistant</div>
              <div className="text-xs text-slate-400">Powered by Hunar.AI</div>
            </div>
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-4 space-y-1">
          <Link href="/" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-50 text-sm font-medium transition-colors">
            <Home className="w-4 h-4" /> Back to Home
          </Link>
          <div className="pt-2 pb-1 px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Menu</div>
          <Link href="/hiring" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-700 hover:bg-violet-50 hover:text-violet-700 text-sm font-medium transition-colors">
            <BarChart2 className="w-4 h-4" /> Dashboard
          </Link>
          <Link href="/hiring/agents" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-700 hover:bg-violet-50 hover:text-violet-700 text-sm font-medium transition-colors">
            <Users className="w-4 h-4" /> Agents
          </Link>
          <Link href="/hiring/calls" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-700 hover:bg-violet-50 hover:text-violet-700 text-sm font-medium transition-colors">
            <Phone className="w-4 h-4" /> All Calls
          </Link>
          <Link href="/hiring/calls/new" className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-violet-600 text-white text-sm font-semibold transition-colors hover:bg-violet-700 mt-2">
            <Plus className="w-4 h-4" /> New Interview
          </Link>
        </nav>

        {/* Bottom badge */}
        <div className="p-4 border-t border-slate-100">
          <div className="rounded-xl bg-violet-50 border border-violet-100 p-3">
            <p className="text-xs text-violet-700 font-medium">Voice AI Active</p>
            <p className="text-xs text-violet-500 mt-0.5">Hunar API connected</p>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="ml-64 min-h-screen">{children}</main>
    </div>
  );
}
