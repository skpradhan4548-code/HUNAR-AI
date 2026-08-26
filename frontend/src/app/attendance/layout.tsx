import type { Metadata } from "next";
import Link from "next/link";
import { MapPin, Home } from "lucide-react";

export const metadata: Metadata = {
  title: "Smart Attendance System | Hunar.AI Platform",
  description: "LLM-powered attendance tracking for 1000 people across 100 locations — no smartphones required",
};

export default function AttendanceLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50">
      <aside className="fixed left-0 top-0 h-full w-64 bg-white border-r border-slate-200 z-40 flex flex-col shadow-sm">
        <div className="p-5 border-b border-slate-100">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
              <MapPin className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="font-bold text-slate-900 text-sm">Smart Attendance</div>
              <div className="text-xs text-slate-400">LLM + IVR Solution</div>
            </div>
          </Link>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          <Link href="/" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-50 text-sm font-medium transition-colors">
            <Home className="w-4 h-4" /> Back to Home
          </Link>
        </nav>

        <div className="p-4 border-t border-slate-100">
          <div className="rounded-xl bg-emerald-50 border border-emerald-100 p-3">
            <p className="text-xs text-emerald-700 font-medium">No Smartphones Needed</p>
            <p className="text-xs text-emerald-500 mt-0.5">IVR · USSD · SMS · Landline</p>
          </div>
        </div>
      </aside>

      <main className="ml-64 min-h-screen">{children}</main>
    </div>
  );
}
