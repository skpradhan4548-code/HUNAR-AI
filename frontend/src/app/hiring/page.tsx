"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Phone, Users, CheckCircle, Clock, AlertCircle, Plus, TrendingUp, Mic } from "lucide-react";
import { agentsApi, callsApi, type Agent, type Call } from "@/lib/api";
import { formatDate, formatDuration, STATUS_COLORS } from "@/lib/utils";

export default function HiringDashboard() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [calls, setCalls] = useState<Call[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      agentsApi.list({ page_size: 20 }),
      callsApi.list({ page_size: 10 }),
    ])
      .then(([a, c]) => {
        setAgents(a.results);
        setCalls(c.results);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const stats = {
    total: calls.length,
    completed: calls.filter((c) => c.lifecycle_status === "COMPLETED").length,
    inProgress: calls.filter((c) => ["IN_PROGRESS", "NOT_STARTED"].includes(c.lifecycle_status)).length,
    failed: calls.filter((c) => ["NOT_CONNECTED", "FAILED"].includes(c.lifecycle_status)).length,
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900">Dashboard</h1>
          <p className="text-slate-500 mt-1">Manage your AI-powered hiring pipeline</p>
        </div>
        <Link
          href="/hiring/calls/new"
          className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white font-semibold px-5 py-2.5 rounded-xl transition-colors shadow-lg shadow-violet-200"
        >
          <Plus className="w-4 h-4" /> New Interview
        </Link>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error} — Make sure the backend is running at localhost:8000
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total Calls", value: stats.total, icon: Phone, color: "violet", bg: "bg-violet-50", text: "text-violet-600", border: "border-violet-100" },
          { label: "Completed", value: stats.completed, icon: CheckCircle, color: "green", bg: "bg-green-50", text: "text-green-600", border: "border-green-100" },
          { label: "In Progress", value: stats.inProgress, icon: Clock, color: "blue", bg: "bg-blue-50", text: "text-blue-600", border: "border-blue-100" },
          { label: "Not Connected", value: stats.failed, icon: AlertCircle, color: "red", bg: "bg-red-50", text: "text-red-600", border: "border-red-100" },
        ].map((s) => (
          <div key={s.label} className={`bg-white rounded-2xl border ${s.border} p-5 shadow-sm`}>
            <div className={`w-10 h-10 ${s.bg} rounded-xl flex items-center justify-center mb-3`}>
              <s.icon className={`w-5 h-5 ${s.text}`} />
            </div>
            <div className="text-3xl font-extrabold text-slate-900">{loading ? "—" : s.value}</div>
            <div className="text-sm text-slate-500 mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Agents */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-bold text-slate-900 flex items-center gap-2">
              <Users className="w-5 h-5 text-violet-600" /> Agents
            </h2>
            <Link href="/hiring/agents" className="text-sm text-violet-600 hover:underline font-medium">View all</Link>
          </div>
          {loading ? (
            <div className="space-y-3">{[1, 2, 3].map((i) => <div key={i} className="skeleton h-14 rounded-xl" />)}</div>
          ) : agents.length === 0 ? (
            <div className="text-center py-8 text-slate-400">
              <Mic className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p className="text-sm">No agents yet</p>
              <Link href="/hiring/agents/new" className="text-xs text-violet-600 hover:underline">Create one</Link>
            </div>
          ) : (
            <div className="space-y-2.5">
              {agents.slice(0, 5).map((agent) => (
                <Link key={agent.id} href={`/hiring/agents`} className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors group">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-xs font-bold">{agent.name[0]}</span>
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-slate-800 truncate">{agent.name}</div>
                    <div className="text-xs text-slate-500">{agent.language} · {agent.voice_persona}</div>
                  </div>
                  <span className={`ml-auto text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[agent.status] || "bg-gray-100 text-gray-600"}`}>
                    {agent.status}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Recent Calls */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-bold text-slate-900 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-violet-600" /> Recent Calls
            </h2>
            <Link href="/hiring/calls" className="text-sm text-violet-600 hover:underline font-medium">View all</Link>
          </div>
          {loading ? (
            <div className="space-y-3">{[1, 2, 3, 4].map((i) => <div key={i} className="skeleton h-16 rounded-xl" />)}</div>
          ) : calls.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <Phone className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="font-medium">No calls yet</p>
              <p className="text-sm mt-1">Create your first interview to get started</p>
              <Link href="/hiring/calls/new" className="mt-3 inline-flex items-center gap-1.5 text-sm text-violet-600 hover:underline font-medium">
                <Plus className="w-3.5 h-3.5" /> New Interview
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {calls.map((call) => (
                <div key={call.id} className="flex items-center gap-4 p-3.5 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                  <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-slate-600 text-xs font-bold">{call.callee_name[0]}</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-semibold text-slate-800">{call.callee_name}</div>
                    <div className="text-xs text-slate-400">{call.mobile_number} · {formatDate(call.created_at)}</div>
                  </div>
                  {call.duration_seconds && (
                    <span className="text-xs text-slate-500 hidden sm:block">{formatDuration(call.duration_seconds)}</span>
                  )}
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${STATUS_COLORS[call.lifecycle_status] || "bg-gray-100 text-gray-600"}`}>
                    {call.lifecycle_status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
