"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Phone, Clock, CheckCircle, AlertCircle, RefreshCw, Plus, Filter } from "lucide-react";
import { callsApi, type Call } from "@/lib/api";
import { formatDate, formatDuration, STATUS_COLORS } from "@/lib/utils";

const STATUSES = ["", "COMPLETED", "IN_PROGRESS", "NOT_STARTED", "NOT_CONNECTED", "FAILED"];

export default function CallsPage() {
  const [calls, setCalls] = useState<Call[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [error, setError] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    callsApi.list({ status: statusFilter || undefined, page_size: 50 })
      .then((r) => setCalls(r.results))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [statusFilter]);

  // Auto-refresh every 15 seconds for live calls
  useEffect(() => {
    const t = setInterval(load, 15000);
    return () => clearInterval(t);
  }, [statusFilter]);

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900">All Calls</h1>
          <p className="text-slate-500 mt-1">Track and monitor all interview calls</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500 text-sm bg-white"
          >
            <option value="">All Statuses</option>
            {STATUSES.filter(Boolean).map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <button onClick={load} className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors">
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
          <Link
            href="/hiring/calls/new"
            className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white font-semibold px-5 py-2.5 rounded-xl transition-colors"
          >
            <Plus className="w-4 h-4" /> New Interview
          </Link>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">{error}</div>
      )}

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Candidate</th>
              <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Phone</th>
              <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
              <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Duration</th>
              <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Created</th>
              <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Result</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  {Array.from({ length: 6 }).map((_, j) => (
                    <td key={j} className="px-6 py-4"><div className="skeleton h-5 rounded w-24" /></td>
                  ))}
                </tr>
              ))
            ) : calls.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-16 text-slate-400">
                  <Phone className="w-10 h-10 mx-auto mb-3 opacity-30" />
                  <p className="font-medium">No calls found</p>
                </td>
              </tr>
            ) : (
              calls.map((call) => (
                <tr key={call.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center text-violet-700 font-bold text-xs flex-shrink-0">
                        {call.callee_name[0]}
                      </div>
                      <span className="font-semibold text-slate-900">{call.callee_name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-500 font-mono text-xs">{call.mobile_number}</td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1 items-start">
                      <span className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium ${
                        call.status === "SCHEDULED" ? "bg-amber-50 text-amber-700 border border-amber-200" :
                        STATUS_COLORS[call.lifecycle_status] || "bg-gray-100 text-gray-600"
                      }`}>
                        {call.lifecycle_status === "COMPLETED" && <CheckCircle className="w-3 h-3" />}
                        {call.status === "SCHEDULED" && <Clock className="w-3 h-3 text-amber-600" />}
                        {call.lifecycle_status === "IN_PROGRESS" && call.status !== "SCHEDULED" && <Clock className="w-3 h-3" />}
                        {["NOT_CONNECTED", "FAILED"].includes(call.lifecycle_status) && <AlertCircle className="w-3 h-3" />}
                        {call.status === "SCHEDULED" ? "SCHEDULED (8 AM - 9 PM)" : call.lifecycle_status}
                      </span>
                      {call.status === "SCHEDULED" && (
                        <span className="text-[10px] text-amber-600">Queued for allowed calling hours (TRAI compliance)</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-500">{formatDuration(call.duration_seconds)}</td>
                  <td className="px-6 py-4 text-slate-500 text-xs">{formatDate(call.created_at)}</td>
                  <td className="px-6 py-4">
                    {call.result ? (
                      <div className="flex flex-wrap gap-1">
                        {Object.entries(call.result).slice(0, 2).map(([k, v]) => (
                          <span key={k} className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-md">
                            {k}: <strong>{String(v)}</strong>
                          </span>
                        ))}
                      </div>
                    ) : <span className="text-slate-300">—</span>}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
