"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Mic, Globe, ChevronRight, RefreshCw } from "lucide-react";
import { agentsApi, type Agent } from "@/lib/api";
import { STATUS_COLORS, LANGUAGE_LABELS, PERSONA_COLORS } from "@/lib/utils";

export default function AgentsPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    agentsApi.list({ page_size: 50 })
      .then((r) => setAgents(r.results))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900">Voice Agents</h1>
          <p className="text-slate-500 mt-1">Manage your AI hiring interview agents</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={load} className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors">
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
          <Link
            href="/hiring/agents/new"
            className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white font-semibold px-5 py-2.5 rounded-xl transition-colors shadow-lg shadow-violet-200"
          >
            <Plus className="w-4 h-4" /> Create Agent
          </Link>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
          Error: {error}
        </div>
      )}

      {loading ? (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => <div key={i} className="skeleton h-52 rounded-2xl" />)}
        </div>
      ) : agents.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-slate-400">
          <Mic className="w-16 h-16 mb-4 opacity-20" />
          <h3 className="text-xl font-semibold text-slate-600 mb-2">No agents found</h3>
          <p className="text-sm mb-6">Create your first AI hiring agent to get started.</p>
          <Link
            href="/hiring/agents/new"
            className="flex items-center gap-2 bg-violet-600 text-white font-semibold px-6 py-3 rounded-xl hover:bg-violet-700 transition-colors"
          >
            <Plus className="w-4 h-4" /> Create First Agent
          </Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
          {agents.map((agent) => (
            <div key={agent.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 p-6">
              {/* Avatar */}
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${PERSONA_COLORS[agent.voice_persona] || "from-violet-500 to-purple-600"} flex items-center justify-center mb-4 shadow-lg`}>
                <Mic className="w-7 h-7 text-white" />
              </div>

              <div className="flex items-start justify-between mb-2">
                <h3 className="font-bold text-slate-900 text-lg leading-tight">{agent.name}</h3>
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${STATUS_COLORS[agent.status] || "bg-gray-100 text-gray-600"}`}>
                  {agent.status}
                </span>
              </div>

              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full font-medium">
                  {agent.voice_persona} · {agent.persona_name || agent.voice_persona}
                </span>
                <span className="text-xs bg-violet-50 text-violet-700 px-2.5 py-1 rounded-full font-medium flex items-center gap-1">
                  <Globe className="w-3 h-3" /> {LANGUAGE_LABELS[agent.language] || agent.language}
                </span>
              </div>

              {agent.summary && (
                <p className="text-sm text-slate-500 mb-4 line-clamp-2">{agent.summary}</p>
              )}

              {/* Variables */}
              {agent.custom_variables?.length > 0 && (
                <div className="mb-4">
                  <div className="text-xs text-slate-400 mb-1.5 font-medium uppercase tracking-wide">Variables</div>
                  <div className="flex flex-wrap gap-1.5">
                    {agent.custom_variables.map((v) => (
                      <span key={v} className="text-xs bg-violet-50 text-violet-700 px-2 py-0.5 rounded-md font-mono">{v}</span>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <Link
                  href="/hiring/calls/new"
                  className="text-sm text-violet-600 hover:text-violet-700 font-semibold flex items-center gap-1"
                >
                  Start Interview
                </Link>
                <span className="text-xs text-slate-400 font-mono">{agent.agent_code}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
