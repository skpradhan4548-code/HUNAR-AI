"use client";

import { useState } from "react";
import { Search, Loader2, Briefcase, MapPin, GraduationCap, Link2, Phone, Star, AlertCircle, CheckCircle, Send, X } from "lucide-react";
import { searchApi, agentsApi, outreachApi, type Candidate, type Agent } from "@/lib/api";

export default function PeopleSearchPage() {
  const [jd, setJd] = useState("");
  const [location, setLocation] = useState("");
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState<Candidate[] | null>(null);
  const [source, setSource] = useState<string>("mock");
  const [error, setError] = useState<string | null>(null);

  // Outreach state
  const [showOutreachModal, setShowOutreachModal] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [outreachForm, setOutreachForm] = useState({ agent_id: "", mobile_number: "+91", job_title: "", company_name: "" });
  const [initiating, setInitiating] = useState(false);
  const [outreachSuccess, setOutreachSuccess] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!jd.trim()) return;
    setSearching(true);
    setError(null);
    setResults(null);
    try {
      const res = await searchApi.search({ job_description: jd, location: location || undefined, limit: 10 });
      setResults(res.results);
      setSource(res.source);
    } catch (e: unknown) {
      setError((e as Error).message);
    } finally {
      setSearching(false);
    }
  };

  const openOutreach = async (candidate: Candidate) => {
    setSelectedCandidate(candidate);
    setOutreachSuccess(null);
    if (agents.length === 0) {
      const a = await agentsApi.list({ status: "ACTIVE", page_size: 20 });
      setAgents(a.results);
      if (a.results.length > 0) setOutreachForm((f) => ({ ...f, agent_id: a.results[0].id }));
    }
    setShowOutreachModal(true);
  };

  const handleOutreach = async () => {
    if (!selectedCandidate || !outreachForm.agent_id) return;
    setInitiating(true);
    try {
      const call = await outreachApi.initiate({
        agent_id: outreachForm.agent_id,
        candidate: selectedCandidate,
        mobile_number: outreachForm.mobile_number,
        job_title: outreachForm.job_title,
        company_name: outreachForm.company_name,
      });
      setOutreachSuccess(call.id);
    } catch (e: unknown) {
      setError((e as Error).message);
    } finally {
      setInitiating(false);
    }
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900">People Search & Reachout</h1>
        <p className="text-slate-500 mt-1">Find matching candidates from your JD and reach out with Voice AI</p>
      </div>

      {/* Search Form */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-8">
        <form onSubmit={handleSearch} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Job Description *</label>
            <textarea
              value={jd} onChange={(e) => setJd(e.target.value)} required
              rows={6}
              placeholder="Paste your full job description here. The AI will extract skills, role, and experience requirements to find matching candidates..."
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-pink-500 text-sm resize-none"
            />
          </div>
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Location Filter (Optional)</label>
              <input
                type="text" value={location} onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Bengaluru, Mumbai"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-pink-500 text-sm"
              />
            </div>
            <div className="flex items-end">
              <button
                type="submit" disabled={searching || !jd.trim()}
                className="flex items-center gap-2 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 disabled:opacity-60 text-white font-semibold px-8 py-2.5 rounded-xl transition-all shadow-lg shadow-pink-200"
              >
                {searching ? <><Loader2 className="w-4 h-4 animate-spin" /> Searching...</> : <><Search className="w-4 h-4" /> Find Candidates</>}
              </button>
            </div>
          </div>
        </form>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
        </div>
      )}

      {/* Results */}
      {results && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-slate-900">
              {results.length} Candidates Found
            </h2>
            <span className={`text-xs px-3 py-1.5 rounded-full font-medium border ${source === "pdl" ? "bg-blue-50 text-blue-700 border-blue-200" : "bg-amber-50 text-amber-700 border-amber-200"}`}>
              {source === "pdl" ? "📊 PDL Data" : "🔮 Mock Data"}
            </span>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {results.map((candidate) => (
              <div key={candidate.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 p-6">
                {/* Header */}
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center flex-shrink-0 shadow">
                    <span className="text-white font-bold text-lg">{candidate.full_name[0]}</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-bold text-slate-900 text-lg leading-tight">{candidate.full_name}</h3>
                    <p className="text-sm text-slate-500 flex items-center gap-1.5 mt-0.5">
                      <Briefcase className="w-3.5 h-3.5" /> {candidate.job_title} @ {candidate.job_company_name}
                    </p>
                  </div>
                  {candidate.linkedin_url && (
                    <a href={candidate.linkedin_url} target="_blank" rel="noreferrer" className="text-blue-500 hover:text-blue-600 transition-colors flex-shrink-0">
                      <Link2 className="w-5 h-5" />
                    </a>
                  )}
                </div>

                {/* Meta */}
                <div className="flex flex-wrap gap-2 mb-3 text-xs text-slate-500">
                  <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {candidate.location_name}</span>
                  {candidate.education && <span className="flex items-center gap-1"><GraduationCap className="w-3 h-3" /> {candidate.education}</span>}
                  <span className="flex items-center gap-1"><Star className="w-3 h-3" /> {candidate.experience_years} yrs exp</span>
                </div>

                {/* Skills */}
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {candidate.skills.slice(0, 6).map((skill) => (
                    <span key={skill} className="text-xs bg-pink-50 text-pink-700 px-2.5 py-1 rounded-full font-medium border border-pink-100">
                      {skill}
                    </span>
                  ))}
                </div>

                {candidate.summary && (
                  <p className="text-sm text-slate-500 mb-4 line-clamp-2">{candidate.summary}</p>
                )}

                <button
                  onClick={() => openOutreach(candidate)}
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-semibold py-2.5 rounded-xl transition-all text-sm shadow-sm"
                >
                  <Phone className="w-4 h-4" /> Voice Outreach
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Outreach Modal */}
      {showOutreachModal && selectedCandidate && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-slate-900">Voice Outreach</h3>
              <button onClick={() => setShowOutreachModal(false)} className="p-2 rounded-lg hover:bg-slate-100 text-slate-500">
                <X className="w-5 h-5" />
              </button>
            </div>

            {outreachSuccess ? (
              <div className="text-center py-6">
                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <h4 className="text-lg font-bold text-slate-900 mb-1">Call Initiated!</h4>
                <p className="text-sm text-slate-500 mb-1">Calling {selectedCandidate.full_name}...</p>
                <code className="text-xs text-violet-600 font-mono">{outreachSuccess}</code>
                <button
                  onClick={() => setShowOutreachModal(false)}
                  className="mt-6 w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-2.5 rounded-xl transition-colors"
                >
                  Close
                </button>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-3 mb-6 p-4 bg-pink-50 rounded-2xl border border-pink-100">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center text-white font-bold">
                    {selectedCandidate.full_name[0]}
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900">{selectedCandidate.full_name}</div>
                    <div className="text-xs text-slate-500">{selectedCandidate.job_title} · {selectedCandidate.job_company_name}</div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Select Agent *</label>
                    <select
                      value={outreachForm.agent_id}
                      onChange={(e) => setOutreachForm((f) => ({ ...f, agent_id: e.target.value }))}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-pink-500 text-sm bg-white"
                    >
                      <option value="">Select an agent...</option>
                      {agents.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Candidate Mobile Number *</label>
                    <input
                      type="tel" value={outreachForm.mobile_number}
                      onChange={(e) => setOutreachForm((f) => ({ ...f, mobile_number: e.target.value }))}
                      placeholder="+91XXXXXXXXXX"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-pink-500 text-sm font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Job Title</label>
                    <input
                      type="text" value={outreachForm.job_title}
                      onChange={(e) => setOutreachForm((f) => ({ ...f, job_title: e.target.value }))}
                      placeholder="e.g. Senior Engineer"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-pink-500 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Your Company</label>
                    <input
                      type="text" value={outreachForm.company_name}
                      onChange={(e) => setOutreachForm((f) => ({ ...f, company_name: e.target.value }))}
                      placeholder="e.g. Acme Corp"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-pink-500 text-sm"
                    />
                  </div>
                </div>

                <button
                  onClick={handleOutreach} disabled={initiating || !outreachForm.agent_id || !outreachForm.mobile_number}
                  className="mt-6 w-full flex items-center justify-center gap-2 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 disabled:opacity-60 text-white font-semibold py-3 rounded-xl transition-all"
                >
                  {initiating ? <><Loader2 className="w-4 h-4 animate-spin" /> Calling...</> : <><Send className="w-4 h-4" /> Initiate Voice Call</>}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
