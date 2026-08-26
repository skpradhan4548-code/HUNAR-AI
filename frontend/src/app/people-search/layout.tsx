import type { Metadata } from "next";
import Link from "next/link";
import { Search, Users, BarChart2, Home, Mic } from "lucide-react";

export const metadata: Metadata = {
  title: "People Search & Reachout | Hunar.AI Platform",
  description: "Find candidates with PDL and reach out via Voice AI",
};

export default function PeopleSearchLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-white border-r border-slate-200 z-40 flex flex-col shadow-sm">
        <div className="p-5 border-b border-slate-100">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center">
              <Search className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="font-bold text-slate-900 text-sm">People Search</div>
              <div className="text-xs text-slate-400">Powered by PDL + Hunar.AI</div>
            </div>
          </Link>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          <Link href="/" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-50 text-sm font-medium transition-colors">
            <Home className="w-4 h-4" /> Back to Home
          </Link>
          <div className="pt-2 pb-1 px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Menu</div>
          <Link href="/people-search" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-700 hover:bg-pink-50 hover:text-pink-700 text-sm font-medium transition-colors">
            <Search className="w-4 h-4" /> Search Talent
          </Link>
          <Link href="/people-search/dashboard" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-700 hover:bg-pink-50 hover:text-pink-700 text-sm font-medium transition-colors">
            <BarChart2 className="w-4 h-4" /> Outreach Dashboard
          </Link>
        </nav>

        <div className="p-4 border-t border-slate-100">
          <div className="rounded-xl bg-pink-50 border border-pink-100 p-3">
            <p className="text-xs text-pink-700 font-medium">PDL + Voice AI</p>
            <p className="text-xs text-pink-500 mt-0.5">Intelligent candidate outreach</p>
          </div>
        </div>
      </aside>

      <main className="ml-64 min-h-screen">{children}</main>
    </div>
  );
}
