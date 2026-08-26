import Link from "next/link";
import { Phone, Users, MapPin, ArrowRight, Mic, Search, Calendar, Zap, Star, CheckCircle } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 text-white">
      {/* Header */}
      <header className="border-b border-white/10 backdrop-blur-sm fixed top-0 w-full z-50 bg-slate-900/80">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg">
              <Mic className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg tracking-tight">
              <span className="text-violet-400">Hunar</span>.AI Platform
            </span>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm text-slate-300">
            <Link href="/hiring" className="hover:text-white transition-colors">Hiring Assistant</Link>
            <Link href="/people-search" className="hover:text-white transition-colors">People Search</Link>
            <Link href="/attendance" className="hover:text-white transition-colors">Smart Attendance</Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-violet-500/20 border border-violet-500/30 rounded-full px-4 py-2 text-sm text-violet-300 mb-8">
            <Zap className="w-4 h-4" />
            Powered by Hunar.AI Voice Agents
          </div>
          <h1 className="text-6xl md:text-7xl font-extrabold tracking-tight mb-6 leading-tight">
            The Future of{" "}
            <span className="bg-gradient-to-r from-violet-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              AI-Driven HR
            </span>
          </h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-12 leading-relaxed">
            Automate hiring interviews, discover top talent with intelligent outreach, and reimagine
            attendance tracking — all powered by conversational Voice AI.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/hiring"
              className="flex items-center gap-2 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white font-semibold px-8 py-4 rounded-2xl transition-all shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 hover:-translate-y-0.5"
            >
              Start Hiring <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/people-search"
              className="flex items-center gap-2 border border-white/20 hover:border-white/40 text-white font-semibold px-8 py-4 rounded-2xl transition-all hover:-translate-y-0.5 backdrop-blur-sm bg-white/5"
            >
              Search Talent
            </Link>
          </div>
        </div>
      </section>

      {/* App Cards */}
      <section className="pb-24 px-6">
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-6">
          {/* App 1 */}
          <Link href="/hiring" className="group">
            <div className="h-full rounded-3xl border border-white/10 bg-white/5 hover:bg-white/10 backdrop-blur-sm p-8 transition-all duration-300 hover:-translate-y-2 hover:border-violet-500/50 hover:shadow-2xl hover:shadow-violet-500/10">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform">
                <Phone className="w-7 h-7 text-white" />
              </div>
              <div className="inline-flex items-center gap-1.5 bg-violet-500/20 text-violet-300 text-xs font-semibold px-3 py-1 rounded-full mb-4">
                <span className="w-1.5 h-1.5 rounded-full bg-violet-400"></span> App 1
              </div>
              <h2 className="text-2xl font-bold text-white mb-3">AI Hiring Assistant</h2>
              <p className="text-slate-400 leading-relaxed mb-6">
                Deploy voice AI agents to conduct phone interviews, qualify candidates, and track results — all automated.
              </p>
              <ul className="space-y-2.5 text-sm text-slate-400">
                {["Voice AI interviews via phone", "Custom interview agents", "Real-time call tracking", "Structured results & scoring"].map((f) => (
                  <li key={f} className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-violet-400 flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <div className="mt-8 flex items-center gap-2 text-violet-400 font-semibold text-sm group-hover:gap-3 transition-all">
                Open Dashboard <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </Link>

          {/* App 2 */}
          <Link href="/people-search" className="group">
            <div className="h-full rounded-3xl border border-white/10 bg-white/5 hover:bg-white/10 backdrop-blur-sm p-8 transition-all duration-300 hover:-translate-y-2 hover:border-pink-500/50 hover:shadow-2xl hover:shadow-pink-500/10">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform">
                <Search className="w-7 h-7 text-white" />
              </div>
              <div className="inline-flex items-center gap-1.5 bg-pink-500/20 text-pink-300 text-xs font-semibold px-3 py-1 rounded-full mb-4">
                <span className="w-1.5 h-1.5 rounded-full bg-pink-400"></span> App 2
              </div>
              <h2 className="text-2xl font-bold text-white mb-3">People Search & Reachout</h2>
              <p className="text-slate-400 leading-relaxed mb-6">
                Paste a job description, discover matching candidates via PDL, and trigger automated voice outreach.
              </p>
              <ul className="space-y-2.5 text-sm text-slate-400">
                {["JD-to-candidate matching", "People Data Labs (PDL) API", "One-click voice outreach", "Conversation results dashboard"].map((f) => (
                  <li key={f} className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-pink-400 flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <div className="mt-8 flex items-center gap-2 text-pink-400 font-semibold text-sm group-hover:gap-3 transition-all">
                Search Talent <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </Link>

          {/* App 3 */}
          <Link href="/attendance" className="group">
            <div className="h-full rounded-3xl border border-white/10 bg-white/5 hover:bg-white/10 backdrop-blur-sm p-8 transition-all duration-300 hover:-translate-y-2 hover:border-emerald-500/50 hover:shadow-2xl hover:shadow-emerald-500/10">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform">
                <MapPin className="w-7 h-7 text-white" />
              </div>
              <div className="inline-flex items-center gap-1.5 bg-emerald-500/20 text-emerald-300 text-xs font-semibold px-3 py-1 rounded-full mb-4">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> App 3
              </div>
              <h2 className="text-2xl font-bold text-white mb-3">Smart Attendance</h2>
              <p className="text-slate-400 leading-relaxed mb-6">
                LLM-powered attendance for 1000 people across 100 locations — no smartphones required. IVR + USSD + SMS.
              </p>
              <ul className="space-y-2.5 text-sm text-slate-400">
                {["No smartphone required", "IVR & USSD integration", "AI verification & fraud detection", "Real-time 100-location dashboard"].map((f) => (
                  <li key={f} className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <div className="mt-8 flex items-center gap-2 text-emerald-400 font-semibold text-sm group-hover:gap-3 transition-all">
                Explore Solution <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </Link>
        </div>
      </section>

      {/* Stats */}
      <section className="border-t border-white/10 py-16 px-6">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { val: "12+", label: "Languages" },
            { val: "6", label: "Voice Personas" },
            { val: "100%", label: "AI-Powered" },
            { val: "<1s", label: "Response Time" },
          ].map((s) => (
            <div key={s.label}>
              <div className="text-4xl font-extrabold text-white mb-2">{s.val}</div>
              <div className="text-slate-400 text-sm">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-8 px-6 text-center text-slate-500 text-sm">
        <p>Built by Saroj Pradhan · Hunar.AI Assignment · 2026</p>
      </footer>
    </div>
  );
}
